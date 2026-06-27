var TrashSection = {
  refs: [],

  seed() {
    return [];
  },

  methods: {
    restoreFromTrash(tid){
      this.save(d=>{
        const e=d.trash.find(x=>x.id===tid); if(!e) return;
        d.trash=d.trash.filter(x=>x.id!==tid);
        if(e.type==='note') d.notes.unshift(e.item);
        else if(e.type==='recipe') d.recipes.unshift(e.item);
        else if(e.type==='checklist') d.checklist.push(e.item);
        else if(e.type==='date') d.dates.push(e.item);
        else if(e.type==='habit') d.habits.push(e.item);
      });
    },
    permDelete(tid){ this.save(d=>{ d.trash=d.trash.filter(x=>x.id!==tid); }); },
  },

  render(ctx) {
    var d=ctx.d, screen=ctx.screen;
    var isS=(k)=>screen===k;
    const trashItems=(d.trash||[]).slice().sort((a,b)=>b.deletedAt-a.deletedAt);
    const typeLabel={note:'Note',recipe:'Recipe',checklist:'Checklist',date:'Key Date',habit:'Habit'};
    const typeColor={note:'#3D6080',recipe:'#6A8FAF',checklist:'#4A6B8A',date:'#CA9A3E',habit:'#4A6B8A'};
    const trashList=trashItems.map(e=>{
      const daysLeft=Math.ceil((7*24*3600*1000-(Date.now()-e.deletedAt))/86400000);
      return {id:e.id,name:e.name,typeLabel:typeLabel[e.type]||e.type,daysLeft,expiry:daysLeft<=1?'expires today':('expires in '+daysLeft+' days'),
        typeStyle:`font-size:11px;font-weight:600;letter-spacing:.08em;padding:3px 8px;border-radius:6px;background:${typeColor[e.type]||'#6A8099'}22;color:${typeColor[e.type]||'#6A8099'};`,
        restore:()=>this.restoreFromTrash(e.id),perm:()=>this.permDelete(e.id)};
    });
    return {
      trashList, trashEmpty:isS('trash')&&trashItems.length===0,
    };
  },
};
