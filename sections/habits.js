var HabitsSection = {
  refs: ['habit'],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    var today = new Date().toDateString();
    return [
      {id:id(),name:'Drink 8 glasses of water',done:false,streak:3,lastDoneDate:null},
      {id:id(),name:'Read 20 minutes',done:true,streak:5,lastDoneDate:today},
      {id:id(),name:'Make the bed',done:true,streak:8,lastDoneDate:today},
      {id:id(),name:'Hit the gym',done:false,streak:2,lastDoneDate:null},
      {id:id(),name:'No phone in bed',done:false,streak:1,lastDoneDate:null},
      {id:id(),name:'Take vitamins',done:true,streak:6,lastDoneDate:today},
    ];
  },

  methods: {
    toggleHabit(id){
      this.save(d=>{
        const h=d.habits.find(x=>x.id===id);
        if(!h) return;
        const today=new Date().toDateString();
        const yesterday=new Date(Date.now()-86400000).toDateString();
        h.done=!h.done;
        if(h.done){
          if(h.lastDoneDate===today){
            // already counted today — no streak change
          } else if(h.lastDoneDate===yesterday){
            h.streak=(h.streak||0)+1;
          } else {
            h.streak=1;
          }
          h.lastDoneDate=today;
        } else {
          if(h.lastDoneDate===today){
            h.streak=Math.max(0,(h.streak||0)-1);
            h.lastDoneDate=null;
          }
          // untoggling a prior day — just uncheck, leave streak intact
        }
      });
    },
    addHabit(name){ if(!name||!name.trim())return; this.save(d=>{ d.habits.push({id:this.uid(),name:name.trim(),done:false,streak:0,lastDoneDate:null}); }); },
    delHabit(id){ this.save(d=>{ const it=d.habits.find(x=>x.id===id); if(it){ d.trash.push({id:this.uid(),type:'habit',name:it.name,item:it,deletedAt:Date.now()}); d.habits=d.habits.filter(x=>x.id!==id); } }); },
    startEditHabit(id,name){ this.setState({editingHabit:id,habitNameDraft:name}); },
    commitEditHabit(id){ const v=(this.state.habitNameDraft||'').trim(); if(!v)return; this.save(d=>{ const h=d.habits.find(x=>x.id===id); if(h) h.name=v; }); this.setState({editingHabit:null,habitNameDraft:''}); },
    setHabitNameDraft(v){ this.setState({habitNameDraft:v}); },
    cancelEditHabit(){ this.setState({editingHabit:null,habitNameDraft:''}); },
  },

  render(ctx) {
    var d=ctx.d, state=ctx.state, enter=ctx.enter, rv=ctx.rv, clr=ctx.clr, refs=ctx.refs;
    var habDone=d.habits.filter(h=>h.done).length;
    var editingHabit=state.editingHabit;
    var habitNameDraft=state.habitNameDraft||'';
    var onHabitNameDraft=(e)=>this.setHabitNameDraft(e.target.value);
    var habitsList=d.habits.map(h=>{
      var isEditing=editingHabit===h.id;
      return {id:h.id,name:h.name,done:h.done,streakLabel:(h.streak||0)+'-day streak',
        isEditing, showNormal:!isEditing,
        toggle:()=>this.toggleHabit(h.id), del:()=>this.delHabit(h.id),
        startEdit:()=>this.startEditHabit(h.id,h.name),
        commitEdit:()=>this.commitEditHabit(h.id),
        cancelEdit:()=>this.cancelEditHabit(),
        onEditKey:enter(()=>this.commitEditHabit(h.id)),
        boxStyle:`width:28px;height:28px;flex:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;border:2px solid ${h.done?'#c4622d':'#c9a090'};background:${h.done?'#c4622d':'transparent'};`,
        nameStyle:`flex:1;font-size:15px;color:${h.done?'#a07868':'#3d2314'};text-decoration:${h.done?'line-through':'none'};`};
    });
    var habitPct=Math.round(habDone/Math.max(1,d.habits.length)*100);
    var addHabitNow=()=>{ const n=rv('habit'); if(!n.trim())return; this.addHabit(n); clr('habit'); };
    return {
      habitsList, habitPct, habitDoneText:habDone+' of '+d.habits.length+' done today',
      habitsEmpty:d.habits.length===0,
      refHabit:refs.habit, addHabitNow, onAddHabitKey:enter(addHabitNow),
      habitNameDraft, onHabitNameDraft,
    };
  },
};
