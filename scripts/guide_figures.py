"""Maintain whole-guide figure captions and bookmark links after document layout."""

from collections import defaultdict
from copy import deepcopy
import re

from docx.oxml import OxmlElement
from docx.oxml.ns import qn

CAPTION = re.compile(r"^Figure\s+([1-9]\d*)(?:[.:]|\s+[—–])\s+\S")
NUMBER = re.compile(r"\bFigure\s+([1-9]\d*)\b", re.I)
LOCAL = re.compile(r"\[\[FIGURE:([1-9]\d*)\]\]")
PREFIX = "guide_fig_"


def _text(element):
    return "".join(node.text or "" for node in element.iter(qn("w:t")))


def _paragraphs(root):
    for paragraph in root.iter(qn("w:p")):
        if next(paragraph.iterdescendants(qn("w:p")), None) is None:
            yield paragraph


def captions(root):
    for paragraph in _paragraphs(root):
        if CAPTION.match(_text(paragraph)) and next(paragraph.iter(qn("w:drawing")), None) is None:
            yield paragraph


def figure_key(paragraph):
    names = [node.get(qn("w:name"), "") for node in paragraph.findall(qn("w:bookmarkStart"))]
    keys = [name for name in names if name.startswith(PREFIX)]
    if len(keys) > 1:
        raise ValueError("A figure caption has multiple figure bookmarks")
    return next(iter(keys), None)


class GuideFigures:
    def __init__(self, document):
        self.body = document._element.body
        self.stories = [self.body]
        for relationship in document.part.rels.values():
            if relationship.reltype.endswith(("/header", "/footer")):
                story = relationship.target_part.element
                if story not in self.stories:
                    self.stories.append(story)
        self.bookmark_id = 1 + max(
            (int(node.get(qn("w:id"))) for story in self.stories
             for node in story.iter(qn("w:bookmarkStart"))),
            default=0,
        )
        self.used_keys = {
            node.get(qn("w:name")) for story in self.stories
            for node in story.iter(qn("w:bookmarkStart"))
        }

    def bookmark(self, paragraph, key=None):
        if key is None:
            key = f"{PREFIX}base_{self.bookmark_id}"
            while key in self.used_keys:
                self.bookmark_id += 1
                key = f"{PREFIX}base_{self.bookmark_id}"
        start = OxmlElement("w:bookmarkStart")
        end = OxmlElement("w:bookmarkEnd")
        start.set(qn("w:name"), key)
        for node in (start, end):
            node.set(qn("w:id"), str(self.bookmark_id))
        properties = paragraph.find(qn("w:pPr"))
        paragraph.insert(1 if properties is not None else 0, start)
        paragraph.append(end)
        self.used_keys.add(key)
        self.bookmark_id += 1
        return key

    def new_keys(self, ticket, count, previous, preserved_slots):
        """Slot positions are local to the selected replacement block."""
        if preserved_slots is None:
            preserved_slots = [None] * count
        if any(slot is not None and slot > len(previous) for slot in preserved_slots):
            raise ValueError("preserveFigureSlots names a screenshot outside the amendment target")
        keys = []
        for index, slot in enumerate(preserved_slots, 1):
            key = previous[slot - 1] if slot is not None else None
            if key is None:
                stem = f"{PREFIX}{ticket.replace('-', '_')}_{index}"
                key = stem
                suffix = 1
                while key in self.used_keys:
                    key = f"{stem}_{suffix}"
                    suffix += 1
            self.used_keys.add(key)
            keys.append(key)
        return keys

    def bind_existing(self):
        """Capture old figure identities before insertions change their numbers."""
        by_number = defaultdict(list)
        placeholders = defaultdict(list)
        ordered = list(captions(self.body))
        existing = set(ordered)
        for paragraph in ordered:
            number = CAPTION.match(_text(paragraph))[1]
            key = figure_key(paragraph) or self.bookmark(paragraph)
            by_number[number].append(key)
            if re.match(r"^Figure\s+\d+\s+[—–]", _text(paragraph)):
                placeholders[number].append(key)

        def resolve(match, targets):
            keys = targets[match[1]]
            if len(keys) != 1:
                raise ValueError(f"Figure {match[1]} has {len(keys)} possible targets. Link it to the intended figure bookmark before rebuilding.")
            return keys[0]

        for story in self.stories:
            for paragraph in _paragraphs(story):
                if paragraph not in existing:
                    targets = placeholders if _text(paragraph).startswith("[Screenshot placeholder") else by_number
                    _bind_links(paragraph, NUMBER, lambda match: resolve(match, targets), skip_fields=True)

    def bind_local(self, paragraph, keys):
        def resolve(match):
            slot = int(match[1])
            if slot > len(keys):
                raise ValueError(f"Figure reference {match[0]} has no screenshot in this update")
            return keys[slot - 1]

        _bind_links(paragraph, LOCAL, resolve)

    def refresh(self):
        numbers = {}
        for number, paragraph in enumerate(captions(self.body), 1):
            key = figure_key(paragraph)
            if not key or key in numbers:
                raise ValueError(f"Figure {number} is missing a unique bookmark")
            numbers[key] = number
            match = CAPTION.match(_text(paragraph))
            _replace_visible_range(paragraph, *match.span(1), str(number))
        for story in self.stories:
            for link in story.iter(qn("w:hyperlink")):
                key = link.get(qn("w:anchor"), "")
                if not key.startswith(PREFIX):
                    continue
                if key not in numbers:
                    raise ValueError(f"Referenced figure {key} was removed. Update its references before rebuilding.")
                nodes = list(link.iter(qn("w:t")))
                if not nodes:
                    raise ValueError(f"Figure link {key} has no display text")
                nodes[0].text = f"Figure {numbers[key]}"
                for node in nodes[1:]:
                    node.text = ""
        return len(numbers)


def _replace_visible_range(paragraph, start, end, replacement):
    offset = 0
    for node in paragraph.iter(qn("w:t")):
        value = node.text or ""
        following = offset + len(value)
        if offset < end and following > start:
            node.text = value[:max(0, start - offset)] + (
                replacement if offset <= start else ""
            ) + value[max(0, end - offset):]
        offset = following
        if offset >= end:
            break


def _bind_links(paragraph, pattern, resolve, *, skip_fields=False):
    if skip_fields and any(node.tag in {qn("w:fldChar"), qn("w:instrText")} for node in paragraph.iter()):
        return
    # Join adjacent text-only runs so Word's arbitrary run splits don't hide a
    # reference. Keep existing links, fields, drawings and control characters.
    groups = []
    current = []
    for child in paragraph:
        if child.tag == qn("w:r") and all(node.tag in {qn("w:rPr"), qn("w:t")} for node in child):
            current.append(child)
        else:
            if current:
                groups.append(current)
                current = []
    if current:
        groups.append(current)
    for group in groups:
        content = "".join(_text(run) for run in group)
        matches = list(pattern.finditer(content))
        if not matches:
            continue

        def emit_range(start, end):
            offset = 0
            for run in group:
                value = _text(run)
                following = offset + len(value)
                if offset < end and following > start:
                    group[0].addprevious(_run(value[max(0, start - offset):end - offset], run))
                offset = following

        cursor = 0
        for match in matches:
            emit_range(cursor, match.start())
            link = OxmlElement("w:hyperlink")
            link.set(qn("w:anchor"), resolve(match))
            link.append(_run(match[0], group[0]))
            group[0].addprevious(link)
            cursor = match.end()
        emit_range(cursor, len(content))
        for run in group:
            paragraph.remove(run)


def _run(value, source):
    run = OxmlElement("w:r")
    properties = source.find(qn("w:rPr"))
    if properties is not None:
        run.append(deepcopy(properties))
    node = OxmlElement("w:t")
    node.set(qn("xml:space"), "preserve")
    node.text = value
    run.append(node)
    return run
