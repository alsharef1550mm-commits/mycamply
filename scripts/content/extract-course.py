"""Rebuild source exercises from the verified PDF extraction; never execute its text."""
import json, re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
pages = json.loads((root / 'docs/source-pages.json').read_text(encoding='utf-8'))
text = '\n'.join(pages[6:])
parts = re.split(r'Chapter (\d+) — ([^\n]+)', text)[1:]
answers = [
 ['atmosphere','convenient','peaceful','suitable','spacious','lively','surroundings','lively','spacious','suitable','atmosphere'],
 ['routine','demanding','efficient','responsibilities','challenging','motivated','flexible'],
 ['recharge','passionate','take up','entertaining','productive','active','creative'],
 ['reliable','outgoing','reserved','considerate','supportive','sincere'],
 ['appetite','filling','tempting','traditional','flavor','balanced'],
 ['exhausted','energetic','typical','spontaneous','occasionally'],
 ['quality','reasonable','practical','worth it','essential','brand'],
 ['freezing','forecast','mild','affect','humid','unpredictable'],
 [],
 ['lyrics','catchy','talented','relaxing','remind'],
]
def clean(s):
    return re.sub(r'\s+([.,?!])', r'\1', re.sub(r'\s+', ' ', s)).strip()

chapters=[]
for i in range(0,len(parts),3):
    number,title,body=parts[i:i+3]
    cid=int(number)
    sections=re.split(r'\n\s*((?:Exercise[^\n]*|Discussion — IELTS Part 1))\s*\n',body)[1:]
    questions=[]
    exercise_index=0
    for j in range(0,len(sections),2):
        heading,content=sections[j:j+2]
        content=content.split('Speaking challenge:')[0]
        items=re.split(r'(?:^|\n)\s*\d+\.\s+',content)[1:]
        for item in items:
            prompt=clean(item.split('Now complete:')[0])
            discussion=heading.startswith('Discussion')
            answer=None
            if not discussion:
                if exercise_index < len(answers[cid-1]): answer=answers[cid-1][exercise_index]
                exercise_index+=1
            questions.append({'id':f'{cid}-source-{len(questions)+1}', 'section':clean(heading),
                'kind':'discussion' if discussion or answer is None else 'fill',
                'prompt':prompt,'expectedAnswer':answer,'origin':'source'})
    chapters.append({'id':cid,'title':clean(title),'questions':questions})
assert len(chapters)==10
assert [len(c['questions']) for c in chapters]==[17,17,17,16,12,13,12,12,12,16]
out={'title':'Everyday English Vocabulary & Speaking','sourcePageCount':21,
     'introduction':[p.strip() for p in pages[:6]],'chapters':chapters}
(root/'artifacts/kambley-word-box/src/data/course-exercises.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"Extracted {sum(len(c['questions']) for c in chapters)} source questions across 10 chapters.")
