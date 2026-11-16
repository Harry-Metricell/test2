import unittest
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from guide_consistency import scan,validate

class ConsistencyTests(unittest.TestCase):
 def test_scans_unchanged_sections_tables_and_headers(self):
  doc=Document();doc.add_paragraph('Earlier section');doc.add_table(rows=1,cols=1).cell(0,0).text='This guide does not cover GIS.'
  doc.sections[0].header.paragraphs[0].text='Coverage gap: library'
  result=scan(doc);self.assertEqual(len(result['issues']),2);self.assertGreaterEqual(result['paragraphsScanned'],3)
 def test_new_caveat_blocked_but_real_limit_allowed(self):
  doc=Document();baseline=scan(doc);doc.add_paragraph('No returned samples does not mean no service. Add Coverage Gap Candidate Areas.')
  self.assertFalse(validate(doc,baseline)['issues'])
  doc.add_paragraph('This guide does not cover the new workspace.')
  with self.assertRaisesRegex(ValueError,'editorial_caveat'):validate(doc,baseline)
 def test_reports_existing_debt_without_silent_rewrites(self):
  doc=Document();doc.add_paragraph('Coverage gap: existing baseline.');baseline=scan(doc)
  doc.add_paragraph('Choose GIS.');self.assertEqual(len(validate(doc,baseline)['issues']),1)
  self.assertIn('Coverage gap',doc.paragraphs[0].text)
 def test_numbered_reference_checks_whole_document(self):
  doc=Document();doc.add_paragraph('2.1 Choose a workspace');doc.add_paragraph('See section 2.1.')
  baseline=scan(doc);self.assertFalse(baseline['issues']);doc.add_paragraph('See section 9.4.')
  with self.assertRaisesRegex(ValueError,'section_reference'):validate(doc,baseline)
 def test_broken_link_and_repaired_bookmark(self):
  doc=Document();baseline=scan(doc);p=doc.add_paragraph();link=OxmlElement('w:hyperlink');link.set(qn('w:anchor'),'gis');p._p.append(link)
  with self.assertRaisesRegex(ValueError,'internal_link'):validate(doc,baseline)
  node=OxmlElement('w:bookmarkStart');node.set(qn('w:name'),'gis');node.set(qn('w:id'),'1');p._p.append(node)
  self.assertFalse(validate(doc,baseline)['issues'])
 def test_caption_and_note_are_not_exempt(self):
  for phrase in ['Figure 1: This walkthrough did not verify this view.','No complete verified procedure is available.']:
   doc=Document();baseline=scan(doc);doc.add_paragraph(phrase)
   with self.assertRaises(ValueError):validate(doc,baseline)
if __name__=='__main__':unittest.main()
