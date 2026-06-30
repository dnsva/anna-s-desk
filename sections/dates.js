var DatesSection = {
  refs: ['dateTitle', 'dateWhen'],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    return [
      {id:id(),title:'Residence move-in day',date:'2026-09-01'},
      {id:id(),title:'EngFrosh / Orientation Week',date:'2026-09-01'},
      {id:id(),title:'1A classes begin',date:'2026-09-08'},
      {id:id(),title:'Course add/drop deadline',date:'2026-09-21'},
      {id:id(),title:'Tuition due',date:'2026-09-30'},
      {id:id(),title:'MATH 117 Midterm',date:'2026-10-15'},
      {id:id(),title:'Fall Reading Week',date:'2026-10-26'},
      {id:id(),title:'ECE 150 Project due',date:'2026-11-13'},
      {id:id(),title:'Last day of 1A classes',date:'2026-12-04'},
      {id:id(),title:'Final exams begin',date:'2026-12-07'},
    ];
  },

  methods: {
    addDate(title,date){ if(!title||!title.trim()||!date)return; this.save(d=>{ d.dates.push({id:this.uid(),title:title.trim(),date}); }); },
    delDate(id){ this.save(d=>{ const it=d.dates.find(x=>x.id===id); if(it){ d.trash.push({id:this.uid(),type:'date',name:it.title,item:it,deletedAt:Date.now()}); d.dates=d.dates.filter(x=>x.id!==id); } }); },
    startEditDate(id,title,date){ this.setState({editingDate:id,dateDraft:{title,date}}); },
    setDateDraft(field,val){ this.setState({dateDraft:{...this.state.dateDraft,[field]:val}}); },
    commitEditDate(id){ const dr=this.state.dateDraft; if(!dr||!dr.title.trim()||!dr.date)return; this.save(d=>{ const it=d.dates.find(x=>x.id===id); if(it){ it.title=dr.title.trim(); it.date=dr.date; } }); this.setState({editingDate:null,dateDraft:null}); },
    cancelEditDate(){ this.setState({editingDate:null,dateDraft:null}); },
  },

  render(ctx) {
    var d=ctx.d, state=ctx.state, enter=ctx.enter, rv=ctx.rv, clr=ctx.clr, refs=ctx.refs;
    var editingDate=state.editingDate;
    var dateDraft=state.dateDraft||{title:'',date:''};
    var sorted=d.dates.map(x=>({...x,n:this.daysUntil(x.date)})).sort((a,b)=>a.n-b.n);
    var makeItem=function(x){
      var urgent=x.n>=0&&x.n<=3, past=x.n<0;
      var bg=past?'#fcd0c4':urgent?'#c4622d':'#b85060';
      var fg=past?'#8a5a4a':'#fff5ef';
      var isEditing=editingDate===x.id;
      return {id:x.id,title:x.title,dateLabel:this.fmtDate(x.date),count:this.countLabel(x.n),
        isEditing,showNormal:!isEditing,
        del:()=>this.delDate(x.id),
        startEdit:()=>this.startEditDate(x.id,x.title,x.date),
        commitEdit:()=>this.commitEditDate(x.id),
        cancelEdit:()=>this.cancelEditDate(),
        onEditTitleKey:enter(()=>this.commitEditDate(x.id)),
        onEditTitle:(e)=>this.setDateDraft('title',e.target.value),
        onEditWhen:(e)=>this.setDateDraft('date',e.target.value),
        badgeStyle:'flex:none;min-width:88px;text-align:center;background:'+bg+';color:'+fg+';font-size:12px;font-weight:600;border-radius:10px;padding:9px 10px;',
        titleStyle:'flex:1;font-family:\'Newsreader\',serif;font-size:18px;color:'+(past?'#a07868':'#3d2314')+';'};
    }.bind(this);
    var upcomingDates=sorted.filter(x=>x.n>=0).map(makeItem);
    var pastDates=sorted.filter(x=>x.n<0).map(makeItem);
    var addDateNow=()=>{ const t=rv('dateTitle'); if(!t.trim()||!rv('dateWhen'))return; this.addDate(t,rv('dateWhen')); clr('dateTitle','dateWhen'); };
    return {
      upcomingDates, pastDates, hasPastDates:pastDates.length>0,
      datesEmpty:d.dates.length===0,
      dateDraft,
      refDateTitle:refs.dateTitle, refDateWhen:refs.dateWhen,
      addDateNow, onAddDateKey:enter(addDateNow),
    };
  },
};
