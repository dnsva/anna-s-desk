var ScheduleSection = {
  refs: ['cName', 'cDay', 'cStart', 'cEnd', 'cLoc', 'cCode', 'cInstructor'],

  COLORS: ['#b85060','#c4622d','#d4845a','#c4a030','#5a7a4a','#3a6a8a','#6a4a8a','#8a5a4a'],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    return [
      {id:id(),name:'MATH 117 – Calculus 1',day:'Mon',start:'08:30',end:'09:20',loc:'MC 4045',color:'#c4622d',code:'MATH 117',instructor:''},
      {id:id(),name:'ECE 105 – Classical Mechanics',day:'Mon',start:'10:30',end:'11:20',loc:'PHY 313',color:'#b85060',code:'ECE 105',instructor:''},
      {id:id(),name:'ECE 140 – Linear Circuits',day:'Mon',start:'13:30',end:'14:50',loc:'E5 6004',color:'#b85060',code:'ECE 140',instructor:''},
      {id:id(),name:'MATH 115 – Linear Algebra',day:'Tue',start:'08:30',end:'09:50',loc:'MC 4045',color:'#8a5a4a',code:'MATH 115',instructor:''},
      {id:id(),name:'ECE 150 – Fundamentals of Programming',day:'Tue',start:'11:30',end:'12:50',loc:'E7 4053',color:'#c4622d',code:'ECE 150',instructor:''},
      {id:id(),name:'MATH 117 – Calculus 1',day:'Wed',start:'08:30',end:'09:20',loc:'MC 4045',color:'#c4622d',code:'MATH 117',instructor:''},
      {id:id(),name:'ECE 105 – Classical Mechanics',day:'Wed',start:'10:30',end:'11:20',loc:'PHY 313',color:'#b85060',code:'ECE 105',instructor:''},
      {id:id(),name:'ECE 190 – Engineering Profession',day:'Wed',start:'13:30',end:'14:20',loc:'EIT 1015',color:'#b05040',code:'ECE 190',instructor:''},
      {id:id(),name:'MATH 115 – Linear Algebra',day:'Thu',start:'08:30',end:'09:50',loc:'MC 4045',color:'#8a5a4a',code:'MATH 115',instructor:''},
      {id:id(),name:'MATH 117 – Tutorial',day:'Thu',start:'10:30',end:'11:20',loc:'MC 4042',color:'#c4622d',code:'MATH 117',instructor:''},
      {id:id(),name:'ECE 150 – Fundamentals of Programming',day:'Thu',start:'11:30',end:'12:50',loc:'E7 4053',color:'#c4622d',code:'ECE 150',instructor:''},
      {id:id(),name:'MATH 117 – Calculus 1',day:'Fri',start:'08:30',end:'09:20',loc:'MC 4045',color:'#c4622d',code:'MATH 117',instructor:''},
      {id:id(),name:'ECE 105 – Classical Mechanics',day:'Fri',start:'10:30',end:'11:20',loc:'PHY 313',color:'#b85060',code:'ECE 105',instructor:''},
      {id:id(),name:'ECE 140 – Lab',day:'Fri',start:'14:30',end:'16:50',loc:'E3 2369',color:'#b85060',code:'ECE 140',instructor:''},
    ];
  },

  methods: {
    addClass(c){
      if(!c.name||!c.name.trim())return;
      const color=this.state.scheduleColor||'#b85060';
      this.save(d=>{ d.classes.push({id:this.uid(),code:'',instructor:'',...c,color,name:c.name.trim()}); });
      this.setState({addingClass:false});
    },
    delClass(id){
      this.save(d=>{
        const item=d.classes.find(x=>x.id===id);
        if(item) d.trash.push({id:this.uid(),type:'schedule',name:item.name,item,deletedAt:Date.now()});
        d.classes=d.classes.filter(x=>x.id!==id);
      });
    },
    setScheduleColor(c){ this.setState({scheduleColor:c}); },
    startEditClass(id){
      const c=this.state.data.classes.find(x=>x.id===id);
      if(!c)return;
      this.setState({editingClass:id,editClassDraft:{name:c.name,day:c.day,start:c.start,end:c.end,loc:c.loc||'',code:c.code||'',instructor:c.instructor||'',color:c.color||'#b85060'}});
    },
    setEditClassDraft(field,val){ this.setState({editClassDraft:{...this.state.editClassDraft,[field]:val}}); },
    commitEditClass(id){
      const dr=this.state.editClassDraft;
      if(!dr||!dr.name.trim())return;
      this.save(d=>{ const c=d.classes.find(x=>x.id===id); if(c) Object.assign(c,{name:dr.name.trim(),day:dr.day,start:dr.start,end:dr.end,loc:dr.loc,code:dr.code,instructor:dr.instructor,color:dr.color}); });
      this.setState({editingClass:null,editClassDraft:null});
    },
    cancelEditClass(){ this.setState({editingClass:null,editClassDraft:null}); },
  },

  render(ctx) {
    var d=ctx.d, state=ctx.state, days=ctx.days, dayFull=ctx.dayFull, todayKey=ctx.todayKey, rv=ctx.rv, clr=ctx.clr, refs=ctx.refs;
    var COLORS=ScheduleSection.COLORS;
    var selColor=state.scheduleColor||'#b85060';
    var editingClass=state.editingClass;
    var editClassDraft=state.editClassDraft||{name:'',day:'Mon',start:'',end:'',loc:'',code:'',instructor:'',color:'#b85060'};
    var week=days.map(function(k){
      var cs=d.classes.filter(function(c){return c.day===k;}).sort(function(a,b){return a.start.localeCompare(b.start);}).map(function(c){
        var isEditing=editingClass===c.id;
        return {name:c.name,loc:c.loc||'',color:c.color,range:c.start+'–'+c.end,
          code:c.code||'',instructor:c.instructor||'',
          hasCode:!!(c.code&&c.code.trim()),hasInstructor:!!(c.instructor&&c.instructor.trim()),
          isEditing,showNormal:!isEditing,
          cardBorder:isEditing?'#b85060':'#e5c4b8',
          del:()=>this.delClass(c.id),
          startEdit:()=>this.startEditClass(c.id),
          commitEdit:()=>this.commitEditClass(c.id),
          cancelEdit:()=>this.cancelEditClass()};
      }.bind(this));
      return {key:k,name:dayFull[k],isToday:k===todayKey,classes:cs,hasClasses:cs.length>0,empty:cs.length===0,
        nameStyle:'font-family:\'Newsreader\',serif;font-size:18px;color:'+(k===todayKey?'#b85060':'#3d2314')+';'};
    }.bind(this));
    var addClassNow=()=>{
      var n=rv('cName'); if(!n.trim())return;
      this.addClass({name:n,day:rv('cDay')||'Mon',start:rv('cStart')||'09:00',end:rv('cEnd')||'09:50',loc:rv('cLoc')||'',code:rv('cCode')||'',instructor:rv('cInstructor')||''});
      clr('cName','cLoc','cCode','cInstructor');
    };
    var colorSwatches=COLORS.map(c=>({color:c,selected:c===selColor,select:()=>this.setScheduleColor(c),
      style:`width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;box-sizing:border-box;border:${c===selColor?'2.5px solid #3d2314':'2.5px solid transparent'};flex:none;transition:border-color .1s;`}));
    var editColorSwatches=COLORS.map(c=>({color:c,select:()=>this.setEditClassDraft('color',c),
      style:`width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;box-sizing:border-box;border:${c===(editClassDraft.color||'#b85060')?'2.5px solid #3d2314':'2.5px solid transparent'};flex:none;transition:border-color .1s;`}));
    return {
      week, addingClass:state.addingClass,
      addClassLabel:state.addingClass?'Close':'+ Add class',
      toggleAddClass:()=>this.setState({addingClass:!state.addingClass}),
      dayOptions:days, addClassNow,
      colorSwatches, editColorSwatches, editClassDraft,
      onEditName:(e)=>this.setEditClassDraft('name',e.target.value),
      onEditDay:(e)=>this.setEditClassDraft('day',e.target.value),
      onEditStart:(e)=>this.setEditClassDraft('start',e.target.value),
      onEditEnd:(e)=>this.setEditClassDraft('end',e.target.value),
      onEditLoc:(e)=>this.setEditClassDraft('loc',e.target.value),
      onEditCode:(e)=>this.setEditClassDraft('code',e.target.value),
      onEditInstructor:(e)=>this.setEditClassDraft('instructor',e.target.value),
      refCName:refs.cName, refCDay:refs.cDay, refCStart:refs.cStart, refCEnd:refs.cEnd, refCLoc:refs.cLoc,
      refCCode:refs.cCode, refCInstructor:refs.cInstructor,
    };
  },
};
