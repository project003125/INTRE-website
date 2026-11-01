import re,os,glob
root=os.getcwd()
bad=[]
for f in glob.glob("**/*.html",recursive=True):
    t=open(f,encoding="utf-8",errors="ignore").read()
    for m in re.finditer(r'href="([^"#?]+)(?:[?#][^"]*)?"',t):
        h=m.group(1)
        if h.startswith(("http:","https:","mailto:","javascript:","data:","tel:")): continue
        if h.startswith("/INTRE-website/"): p=h.replace("/INTRE-website/","")
        elif h.startswith("/"): p=h.lstrip("/")
        else:
            base=os.path.dirname(f); p=os.path.normpath(os.path.join(base,h))
        p=p.replace("\\","/")
        if p.endswith("/"): p=p+"index.html"
        if not os.path.exists(p) and not os.path.exists(p+"/index.html"):
            bad.append((f,h))
print("broken_local_links=",len(bad))
for f,h in bad[:12]: print(" ",f,"->",h)
