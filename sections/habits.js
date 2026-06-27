var HabitsSection = {
  refs: ['habit'],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    return [
      {id:id(),name:'Drink 8 glasses of water',done:false,streak:3},
      {id:id(),name:'Read 20 minutes',done:true,streak:5},
      {id:id(),name:'Make the bed',done:true,streak:8},
      {id:id(),name:'Hit the gym',done:false,streak:2},
      {id:id(),name:'No phone in bed',done:false,streak:1},
      {id:id(),name:'Take vitamins',done:true,streak:6},
    ];
  },

  methods: {
    toggleHabit(id){ this.save(d=>{ const h=d.habits.find(x=>x.id===id); if(h){ h.done=!h.done; h.streak=Math.max(0,(h.streak||0)+(h.done?1:-1)); } }); },
    addHabit(name){ if(!name||!name.trim())return; this.save(d=>{ d.habits.push({id:this.uid(),name:name.trim(),done:false,streak:0}); }); },
    delHabit(id){ this.save(d=>{ const it=d.habits.find(x=>x.id===id); if(it){ d.trash.push({id:this.uid(),type:'habit',name:it.name,item:it,deletedAt:Date.now()}); d.habits=d.habits.filter(x=>x.id!==id); } }); },
  },

  render(ctx) {
    var d=ctx.d, enter=ctx.enter, rv=ctx.rv, clr=ctx.clr, refs=ctx.refs;
    var habDone=d.habits.filter(h=>h.done).length;
    var habitsList=d.habits.map(h=>({id:h.id,name:h.name,done:h.done,streakLabel:(h.streak||0)+'-day streak',
      toggle:()=>this.toggleHabit(h.id),del:()=>this.delHabit(h.id),
      boxStyle:`width:28px;height:28px;flex:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;border:2px solid ${h.done?'#4A6B8A':'#B0C4D8'};background:${h.done?'#4A6B8A':'transparent'};`,
      nameStyle:`flex:1;font-size:15px;color:${h.done?'#8A9BB0':'#2C3646'};text-decoration:${h.done?'line-through':'none'};`}));
    var habitPct=Math.round(habDone/Math.max(1,d.habits.length)*100);
    var addHabitNow=()=>{ const n=rv('habit'); if(!n.trim())return; this.addHabit(n); clr('habit'); };
    return {
      habitsList, habitPct, habitDoneText:habDone+' of '+d.habits.length+' done today',
      refHabit:refs.habit, addHabitNow, onAddHabitKey:enter(addHabitNow),
    };
  },
};
