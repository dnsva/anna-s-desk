var WorkoutSection = {
  refs: ['exName', 'exScheme'],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    return {
      Mon:{label:'Legs',items:[
        {id:id(),name:'Back Squat',sets:7,reps:5,weight:0,prev:0,done:false,scheme:'1×12 bar · 1×12 10lb/side · 5×5 32.5lb/side'},
        {id:id(),name:'Leg Extensions',sets:4,reps:12,weight:0,prev:0,done:false,scheme:'1×12 warmup · 2×12-15 32kg · 1×failure dropset 36kg'},
        {id:id(),name:'Pendulum Squat',sets:4,reps:10,weight:0,prev:0,done:false,scheme:'1×12 warmup · 3×8-12 45lb'},
        {id:id(),name:'Pilates',sets:0,reps:0,weight:0,prev:0,done:false,isClass:true,instructor:'Kimberly',classTime:'5:30'},
        {id:id(),name:'Rhythm and Beats',sets:0,reps:0,weight:0,prev:0,done:false,isClass:true,instructor:'Kim',classTime:'5:30'},
        {id:id(),name:'Sculpt',sets:0,reps:0,weight:0,prev:0,done:false,isClass:true,instructor:'Savahanna',classTime:'5:45'},
      ]},
      Tue:{label:'Pull',items:[
        {id:id(),name:'Barbell Curls',sets:3,reps:0,weight:0,prev:0,done:false,scheme:'3×failure (40lb)'},
        {id:id(),name:'Single Arm Dumbbell Row',sets:3,reps:12,weight:0,prev:0,done:false,scheme:'3×12 (32.5-35lb)'},
        {id:id(),name:'Face Pulls',sets:3,reps:13,weight:0,prev:0,done:false,scheme:'3×12-15 (80lb) · last set to failure'},
        {id:id(),name:'Standing Dumbbell Bicep Curls',sets:3,reps:10,weight:0,prev:0,done:false,scheme:'3×8-12 (20lb)'},
        {id:id(),name:'TRX',sets:0,reps:0,weight:0,prev:0,done:false,isClass:true,instructor:'Savahanna',classTime:'5:30'},
      ]},
      Wed:{label:'Push',items:[
        {id:id(),name:'Overhead Barbell Press',sets:7,reps:5,weight:0,prev:0,done:false,scheme:'2×12 20lb · 5×5 40lb'},
        {id:id(),name:'Skull Crushers',sets:7,reps:5,weight:0,prev:0,done:false,scheme:'2×12 20lb · 5×5 40lb'},
        {id:id(),name:'Tricep Pushdown',sets:3,reps:0,weight:0,prev:0,done:false,scheme:'3×failure (20lb resistance)'},
        {id:id(),name:'Dumbbell Shoulder Press',sets:4,reps:9,weight:0,prev:0,done:false,scheme:'4×8-10 (22.5lb)'},
        {id:id(),name:'Bench Dips',sets:3,reps:15,weight:0,prev:0,done:false,scheme:'3×15'},
        {id:id(),name:'Pec Fly',sets:2,reps:13,weight:0,prev:0,done:false,scheme:'2×12-15 (60lb)'},
      ]},
      Thu:{label:'Legs',items:[
        {id:id(),name:'Leg Curl',sets:4,reps:11,weight:0,prev:0,done:false,scheme:'1×12 warmup 9kg · 3×10-12 27kg (60-65lb)'},
        {id:id(),name:'Standing Calf Raises',sets:4,reps:17,weight:0,prev:0,done:false,scheme:'4×15-20 (18kg machine)'},
        {id:id(),name:'Pilates',sets:0,reps:0,weight:0,prev:0,done:false,isClass:true,instructor:'Annie',classTime:'9:30'},
        {id:id(),name:'Hot Sweat and Surrender',sets:0,reps:0,weight:0,prev:0,done:false,isClass:true,instructor:'Linda',classTime:'12:00'},
      ]},
      Fri:{label:'Pull',items:[
        {id:id(),name:'Cable Bicep Curls',sets:3,reps:0,weight:0,prev:0,done:false,scheme:'1×12 25lb · 2×failure 30lb'},
        {id:id(),name:'Seated Row',sets:3,reps:11,weight:0,prev:0,done:false,scheme:'3×10-12 (18kg+)'},
        {id:id(),name:'Face Pulls',sets:3,reps:13,weight:0,prev:0,done:false,scheme:'3×12-15 (80lb)'},
        {id:id(),name:'Hammer Curls',sets:3,reps:10,weight:0,prev:0,done:false,scheme:'3×8-12 (17.5lb)'},
        {id:id(),name:'Single Arm Dumbbell Row',sets:3,reps:12,weight:0,prev:0,done:false,scheme:'3×12 (32.5lb)'},
      ]},
      Sat:{label:'Push',items:[
        {id:id(),name:'Lat Raise Machine',sets:4,reps:13,weight:0,prev:0,done:false,scheme:'1×15 warmup · 3×12-15 (30lb)'},
        {id:id(),name:'Rear Delt Fly',sets:3,reps:13,weight:0,prev:0,done:false,scheme:'3×12-15 (45lb / 20kg)'},
        {id:id(),name:'Bench Press',sets:4,reps:10,weight:0,prev:0,done:false,scheme:'1×12 25lb · 3×8-12 50lb'},
        {id:id(),name:'Dumbbell Shoulder Press',sets:4,reps:9,weight:0,prev:0,done:false,scheme:'4×8-10 (22.5lb)'},
        {id:id(),name:'Power Barbell',sets:0,reps:0,weight:0,prev:0,done:false,isClass:true,instructor:'Danielle',classTime:'9:45'},
      ]},
      Sun:{label:'Cycling',items:[
        {id:id(),name:'Cycling',sets:0,reps:0,weight:0,prev:0,done:false,isClass:true,instructor:'Lana',classTime:'9:30'},
      ]},
    };
  },

  methods: {
    setWorkoutDay(k){ this.setState({workoutDay:k}); },
    toggleEx(day,id){ this.save(d=>{ const it=d.workout[day].items.find(x=>x.id===id); if(it) it.done=!it.done; }); },
    addEx(day,name,scheme){ if(!name||!name.trim())return; this.save(d=>{ d.workout[day].items.push({id:this.uid(),name:name.trim(),scheme:(scheme||'').trim(),done:false}); }); },
    delEx(day,id){ this.save(d=>{ d.workout[day].items=d.workout[day].items.filter(x=>x.id!==id); }); },
    startScheme(day,id,cur){ this.setState({editingScheme:day+':'+id,schemeDraft:cur||''}); },
    commitScheme(day,id){ const v=this.state.schemeDraft.trim(); this.save(d=>{ const it=d.workout[day].items.find(x=>x.id===id); if(it) it.scheme=v; }); this.setState({editingScheme:null,schemeDraft:''}); },
    setSchemeDraft(v){ this.setState({schemeDraft:v}); },
  },

  render(ctx) {
    var d=ctx.d, state=ctx.state, days=ctx.days, dayFull=ctx.dayFull, todayKey=ctx.todayKey, enter=ctx.enter, rv=ctx.rv, clr=ctx.clr, refs=ctx.refs;
    var wDay=state.workoutDay||todayKey;
    var workoutTabs=days.map(k=>({key:k,label:k,go:()=>this.setWorkoutDay(k),
      style:`flex:none;padding:9px 15px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;text-align:center;background:${k===wDay?'#8a5a4a':'#fff2ee'};color:${k===wDay?'#fff5ef':'#5a2d1a'};border:1px solid ${k===wDay?'#8a5a4a':'#e5c4b8'};`,
      dotShow:k===todayKey,dotStyle:`width:5px;height:5px;border-radius:50%;margin:4px auto 0;background:${k===wDay?'#fff5ef':'#8a5a4a'};`}));
    var wd=d.workout[wDay]||{label:'',items:[]};
    var wDoneN=wd.items.filter(x=>x.done).length;
    var editingScheme=state.editingScheme;
    var onSchemeDraft=(e)=>this.setSchemeDraft(e.target.value);
    var workoutItems=wd.items.map(it=>{
      const hasScheme=!!it.scheme, isClass=!!it.isClass;
      const schemeText=hasScheme?it.scheme:(isClass?'':(it.sets&&it.reps?(it.sets+' × '+it.reps):''));
      const editingS=!isClass&&editingScheme===wDay+':'+it.id;
      const subtitle=isClass?((it.instructor||'')+(it.classTime?' · '+it.classTime:'')):'';
      const schemeChips=schemeText?schemeText.split(' · ').map(s=>({text:s.trim()})):[{text:'tap to set scheme'}];
      return {id:it.id,name:it.name,isClass,subtitle,schemeText,schemeChips,done:it.done,
        editingS,schemeTagShow:!isClass&&!editingS,schemeInputShow:!isClass&&editingS,
        toggle:()=>this.toggleEx(wDay,it.id),del:()=>this.delEx(wDay,it.id),
        startS:()=>this.startScheme(wDay,it.id,schemeText),
        commitS:()=>this.commitScheme(wDay,it.id),
        onSchemeKey:enter(()=>this.commitScheme(wDay,it.id)),
        cardBg:isClass?'#fff5f2':'#fff2ee',cardBorder:isClass?'#f5c4b8':'#e5c4b8',
        boxStyle:`width:26px;height:26px;flex:none;border-radius:${isClass?'50%':'8px'};cursor:pointer;display:flex;align-items:center;justify-content:center;border:2px solid ${it.done?(isClass?'#b85060':'#8a5a4a'):(isClass?'#e8a090':'#c9a090')};background:${it.done?(isClass?'#b85060':'#8a5a4a'):'transparent'};`,
        nameStyle:`font-size:15px;font-weight:500;color:${it.done?'#a07868':'#3d2314'};text-decoration:${it.done?'line-through':'none'};`};
    });
    var addExNow=()=>{ const n=rv('exName'); if(!n.trim())return; this.addEx(wDay,n,rv('exScheme')); clr('exName','exScheme'); };
    return {
      workoutTabs, workoutLabel:wd.label, workoutDayLabel:dayFull[wDay],
      workoutItems, workoutHasItems:wd.items.length>0, workoutEmpty:wd.items.length===0,
      workoutDoneText:wd.items.length?(wDoneN+' of '+wd.items.length+' done'):'Recovery day — rest up',
      schemeDraft:state.schemeDraft, onSchemeDraft,
      refExName:refs.exName, refExScheme:refs.exScheme, addExNow, onAddExKey:enter(addExNow),
    };
  },
};
