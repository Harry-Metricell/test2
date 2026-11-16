"""Cheap whole-document checks; not a substitute for evidence-based editorial judgement."""
from collections import Counter
import re
from docx.oxml.ns import qn

CAVEAT = re.compile(
    r"\b(?:coverage|documentation) gap\s*[:—-]|"
    r"\b(?:this|the) (?:guide|walkthrough|document) (?:does not|doesn't|doesn’t|cannot|has not|hasn't|hasn’t)\b|"
    r"\bnot (?:covered|documented|verified|validated|tested) (?:in|by|during) (?:this|the|our) (?:guide|walkthrough|review)\b|"
    r"\bno complete (?:verified )?(?:procedure|instructions)\b|"
    r"\b(?:supplied walkthrough|retained source|this walkthrough)\b", re.I)

def scan(document):
    """Walk all Word stories, including table cells, hyperlinks and text boxes."""
    roots = [('body', document._element)]
    seen = {id(document.part)}
    for rel in document.part.rels.values():
        if rel.reltype.endswith(('/header', '/footer')) and id(rel.target_part) not in seen:
            seen.add(id(rel.target_part)); roots.append((rel.reltype.rsplit('/', 1)[-1], rel.target_part.element))
    paragraphs=[]; anchors=set(); links=[]
    for story,root in roots:
        anchors.update(n.get(qn('w:name')) for n in root.iter(qn('w:bookmarkStart')))
        links.extend(n.get(qn('w:anchor')) for n in root.iter(qn('w:hyperlink')) if n.get(qn('w:anchor')))
        for p in root.iter(qn('w:p')):
            # An outer paragraph can contain a text box with its own paragraphs.
            if any(n is not p for n in p.iter(qn('w:p'))):continue
            text=''.join(n.text or '' for n in p.iter(qn('w:t'))).strip()
            if text and not text.startswith('[['):paragraphs.append((story,text))
    headings={m.group(1) for _,text in paragraphs if (m:=re.match(r'^(\d+(?:\.\d+)*)\s+\S',text))}
    issues=[]
    for story,text in paragraphs:
        if CAVEAT.search(text):issues.append({'kind':'editorial_caveat','story':story,'text':text})
        for match in re.finditer(r'\bsection\s+(\d+(?:\.\d+)*)\b',text,re.I):
            if match.group(1) not in headings:issues.append({'kind':'section_reference','story':story,'text':text,'target':match.group(1)})
    issues += [{'kind':'internal_link','target':link,'text':link} for link in sorted(set(links)-anchors)]
    return {'scope':'whole_document','paragraphsScanned':len(paragraphs),'storiesScanned':len(roots),'headingNumbersChecked':len(headings),'internalLinksChecked':len(links),'issues':issues}

def validate(document, baseline):
    result=scan(document)
    previous=Counter((i['kind'],i['text'],i.get('target','')) for i in baseline['issues'])
    introduced=[]
    for issue in result['issues']:
        key=(issue['kind'],issue['text'],issue.get('target',''))
        if previous[key]:previous[key]-=1
        else:introduced.append(issue)
    # Existing editorial debt is reported, never silently rewritten by a renderer.
    # New caveats and broken references cannot be added by the current update.
    if introduced:raise ValueError('Whole-guide consistency check: '+ '; '.join(i['kind']+': '+i['text'][:180] for i in introduced))
    result['introducedIssues']=[]
    result['semanticLimit']='Rules scan the entire document; related wording still requires author judgement against evidence.'
    return result
