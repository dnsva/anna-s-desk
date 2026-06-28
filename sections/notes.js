var NotesSection = {
  refs: [],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    return [
      {id:id(),title:'ECE 150 – C++ notes',body:'Pointers are on week 4 — review before tutorial. Office hours: MC 3rd floor. Linux servers: linux.student.cs.uwaterloo.ca. Assignments auto-graded, submit before midnight.',ts:Date.now()-86400000},
      {id:id(),title:'1A survival brain dump',body:'- email academic advisor re: course load\n- best coffee: DP (Davis Centre) or the Plaza\n- ECE Society Discord for study groups\n- MathSoc game room in MC is free + open\n- WUSA food bank in SLC no questions asked\n- grab the free printing on the 1st floor DC',ts:Date.now()-3600000},
    ];
  },

  methods: {
    newNote(){ const nid=this.uid(); this.save(d=>{ d.notes.unshift({id:nid,title:'',body:'',ts:Date.now()}); }); this.setState({noteOpen:nid}); },
    updateNote(id,field,v){ this.save(d=>{ const n=d.notes.find(x=>x.id===id); if(n){ n[field]=v; n.ts=Date.now(); } }); },
    delNote(id){ const note=this.state.data.notes.find(x=>x.id===id); this.save(d=>{ if(note){ d.trash.push({id:this.uid(),type:'note',name:(note.title||'').trim()||'Untitled',item:note,deletedAt:Date.now()}); } d.notes=d.notes.filter(x=>x.id!==id); }); this.setState({noteOpen:null}); },
  },

  render(ctx) {
    var d=ctx.d, screen=ctx.screen;
    var isS=(k)=>screen===k;
    const stripHtml=(h)=>(h||'').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
    const notesList=d.notes.map(n=>({id:n.id,title:(n.title||'').trim()||'Untitled',snippet:(stripHtml(n.body).slice(0,100))||'Empty note',open:()=>this.setState({noteOpen:n.id}),del:()=>this.delNote(n.id)}));
    const no=d.notes.find(n=>n.id===this.state.noteOpen);
    const openNote=no?{title:no.title,body:no.body,close:()=>this.setState({noteOpen:null}),del:()=>this.delNote(no.id),setTitle:(e)=>this.updateNote(no.id,'title',e.target.value),onInput:(e)=>this.updateNote(no.id,'body',e.currentTarget.innerHTML)}:null;
    const execCmd=(cmd,val)=>{document.execCommand(cmd,false,val||null);};
    const fmt=this.state.noteActiveFmt||{};
    const fmtBg=(k)=>fmt[k]?'background:#ddb8a8;border-radius:7px;':'';
    const updateFmt=()=>{try{this.setState({noteActiveFmt:{bold:document.queryCommandState('bold'),italic:document.queryCommandState('italic'),underline:document.queryCommandState('underline'),strike:document.queryCommandState('strikeThrough'),ul:document.queryCommandState('insertUnorderedList'),ol:document.queryCommandState('insertOrderedList')}});}catch(ex){}};
    const saveBody=()=>{if(this.state.noteOpen&&this._noteBodyEl)this.updateNote(this.state.noteOpen,'body',this._noteBodyEl.innerHTML);};
    const noteCmd={
      bold:(e)=>{e.preventDefault();execCmd('bold');updateFmt();saveBody();},
      italic:(e)=>{e.preventDefault();execCmd('italic');updateFmt();saveBody();},
      underline:(e)=>{e.preventDefault();execCmd('underline');updateFmt();saveBody();},
      strike:(e)=>{e.preventDefault();execCmd('strikeThrough');updateFmt();saveBody();},
      ul:(e)=>{e.preventDefault();execCmd('insertUnorderedList');updateFmt();saveBody();},
      ol:(e)=>{e.preventDefault();execCmd('insertOrderedList');updateFmt();saveBody();},
      hlYellow:(e)=>{e.preventDefault();execCmd('hiliteColor','#FFF59D');saveBody();},
      hlGreen:(e)=>{e.preventDefault();execCmd('hiliteColor','#C8E6C9');saveBody();},
      hlBlue:(e)=>{e.preventDefault();execCmd('hiliteColor','#BBDEFB');saveBody();},
      hlPink:(e)=>{e.preventDefault();execCmd('hiliteColor','#F8BBD9');saveBody();},
      hlOrange:(e)=>{e.preventDefault();execCmd('hiliteColor','#FFE0B2');saveBody();},
      removeFormat:(e)=>{e.preventDefault();execCmd('removeFormat');try{execCmd('hiliteColor','inherit');}catch(ex){}try{execCmd('backColor','inherit');}catch(ex){}updateFmt();saveBody();},
      blur:()=>saveBody(),
      keyDown:(e)=>{const m=e.metaKey||e.ctrlKey;if(!m)return;if(e.key==='b'){e.preventDefault();execCmd('bold');updateFmt();}else if(e.key==='i'){e.preventDefault();execCmd('italic');updateFmt();}else if(e.key==='u'){e.preventDefault();execCmd('underline');updateFmt();}else if(e.key==='z'){e.preventDefault();execCmd(e.shiftKey?'redo':'undo');}else if(e.key==='y'){e.preventDefault();execCmd('redo');}},
    };
    const noteFmtBoldStyle=`width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:7px;cursor:pointer;font-weight:700;font-size:14px;color:#3d2314;${fmtBg('bold')}`;
    const noteFmtItalicStyle=`width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:7px;cursor:pointer;font-style:italic;font-size:14px;color:#3d2314;${fmtBg('italic')}`;
    const noteFmtUnderlineStyle=`width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:7px;cursor:pointer;font-size:14px;color:#3d2314;text-decoration:underline;${fmtBg('underline')}`;
    const noteFmtStrikeStyle=`width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:7px;cursor:pointer;font-size:14px;color:#3d2314;text-decoration:line-through;${fmtBg('strike')}`;
    const noteFmtUlStyle=`width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:7px;cursor:pointer;font-size:16px;color:#3d2314;${fmtBg('ul')}`;
    const noteFmtOlStyle=`width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:7px;cursor:pointer;font-size:12px;color:#3d2314;font-weight:600;${fmtBg('ol')}`;
    return {
      notesList, openNote, noteCmd,
      notesListShown:isS('notes')&&!openNote, noteEditorShown:isS('notes')&&!!openNote,
      noteFmtBoldStyle, noteFmtItalicStyle, noteFmtUnderlineStyle,
      noteFmtStrikeStyle, noteFmtUlStyle, noteFmtOlStyle,
      goNewNote:()=>this.newNote(), notesEmpty:isS('notes')&&!openNote&&d.notes.length===0,
    };
  },
};
