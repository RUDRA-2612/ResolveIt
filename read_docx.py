import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_docx(docx_path, out_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            # Namespace dictionary
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for paragraph in tree.iterfind('.//w:p', ns):
                para_text = []
                for run in paragraph.iterfind('.//w:r', ns):
                    for t in run.iterfind('.//w:t', ns):
                        if t.text:
                            para_text.append(t.text)
                text.append(''.join(para_text))
            
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(text))
    except Exception as e:
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(str(e))

if __name__ == '__main__':
    extract_text_from_docx(sys.argv[1], sys.argv[2])
