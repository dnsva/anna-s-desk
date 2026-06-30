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
        else if(e.type==='photo') d.photos.push(e.item);
        else if(e.type==='workout') { if(d.workout[e.day]) d.workout[e.day].items.push(e.item); }
        else if(e.type==='schedule') d.classes.push(e.item);
      });
    },
    permDelete(tid){ this.save(d=>{ d.trash=d.trash.filter(x=>x.id!==tid); }); },
  },

  render(ctx) {
    var d=ctx.d, screen=ctx.screen;
    var isS=(k)=>screen===k;
    const trashItems=(d.trash||[]).slice().sort((a,b)=>b.deletedAt-a.deletedAt);
    const typeLabel={note:'Note',recipe:'Recipe',checklist:'Checklist',date:'Key Date',habit:'Habit',photo:'Photo',workout:'Exercise',schedule:'Class'};
    const typeColor={note:'#8b3020',recipe:'#d4845a',checklist:'#c4622d',date:'#b85060',habit:'#c4622d',photo:'#b05040',workout:'#8a5a4a',schedule:'#b85060'};
    const trashList=trashItems.map(e=>{
      const daysLeft=Math.ceil((7*24*3600*1000-(Date.now()-e.deletedAt))/86400000);
      return {id:e.id,name:e.name,typeLabel:typeLabel[e.type]||e.type,daysLeft,expiry:daysLeft<=1?'expires today':('expires in '+daysLeft+' days'),
        typeStyle:`font-size:11px;font-weight:600;letter-spacing:.08em;padding:3px 8px;border-radius:6px;background:${typeColor[e.type]||'#8a5a4a'}22;color:${typeColor[e.type]||'#8a5a4a'};`,
        restore:()=>this.restoreFromTrash(e.id),perm:()=>this.permDelete(e.id)};
    });
    return {
      trashList, trashEmpty:isS('trash')&&trashItems.length===0,
    };
  },
};
