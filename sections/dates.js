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
  },

  render(ctx) {
    var d=ctx.d, enter=ctx.enter, rv=ctx.rv, clr=ctx.clr, refs=ctx.refs;
    var datesList=d.dates.map(x=>({...x,n:this.daysUntil(x.date)})).sort((a,b)=>a.n-b.n).map(x=>{
      const urgent=x.n>=0&&x.n<=3, past=x.n<0;
      const bg=past?'#D0DCE8':urgent?'#4A6B8A':'#CA9A3E';
      const fg=past?'#6A8099':'#EBF3FB';
      return {id:x.id,title:x.title,dateLabel:this.fmtDate(x.date),count:this.countLabel(x.n),
        del:()=>this.delDate(x.id),
        badgeStyle:`flex:none;min-width:88px;text-align:center;background:${bg};color:${fg};font-size:12px;font-weight:600;border-radius:10px;padding:9px 10px;`,
        titleStyle:`flex:1;font-family:'Newsreader',serif;font-size:18px;color:${past?'#8A9BB0':'#2C3646'};`};
    });
    var addDateNow=()=>{ const t=rv('dateTitle'); if(!t.trim()||!rv('dateWhen'))return; this.addDate(t,rv('dateWhen')); clr('dateTitle','dateWhen'); };
    return {
      datesList, refDateTitle:refs.dateTitle, refDateWhen:refs.dateWhen,
      addDateNow, onAddDateKey:enter(addDateNow),
    };
  },
};
