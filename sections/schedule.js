var ScheduleSection = {
  refs: ['cName', 'cDay', 'cStart', 'cEnd', 'cLoc'],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    return [
      {id:id(),name:'MATH 117 – Calculus 1',day:'Mon',start:'08:30',end:'09:20',loc:'MC 4045',color:'#8b1e3f'},
      {id:id(),name:'ECE 105 – Classical Mechanics',day:'Mon',start:'10:30',end:'11:20',loc:'PHY 313',color:'#2b9720'},
      {id:id(),name:'ECE 140 – Linear Circuits',day:'Mon',start:'13:30',end:'14:50',loc:'E5 6004',color:'#2b9720'},
      {id:id(),name:'MATH 115 – Linear Algebra',day:'Tue',start:'08:30',end:'09:50',loc:'MC 4045',color:'#3a7a25'},
      {id:id(),name:'ECE 150 – Fundamentals of Programming',day:'Tue',start:'11:30',end:'12:50',loc:'E7 4053',color:'#8b1e3f'},
      {id:id(),name:'MATH 117 – Calculus 1',day:'Wed',start:'08:30',end:'09:20',loc:'MC 4045',color:'#8b1e3f'},
      {id:id(),name:'ECE 105 – Classical Mechanics',day:'Wed',start:'10:30',end:'11:20',loc:'PHY 313',color:'#2b9720'},
      {id:id(),name:'ECE 190 – Engineering Profession',day:'Wed',start:'13:30',end:'14:20',loc:'EIT 1015',color:'#9b2848'},
      {id:id(),name:'MATH 115 – Linear Algebra',day:'Thu',start:'08:30',end:'09:50',loc:'MC 4045',color:'#3a7a25'},
      {id:id(),name:'MATH 117 – Tutorial',day:'Thu',start:'10:30',end:'11:20',loc:'MC 4042',color:'#8b1e3f'},
      {id:id(),name:'ECE 150 – Fundamentals of Programming',day:'Thu',start:'11:30',end:'12:50',loc:'E7 4053',color:'#8b1e3f'},
      {id:id(),name:'MATH 117 – Calculus 1',day:'Fri',start:'08:30',end:'09:20',loc:'MC 4045',color:'#8b1e3f'},
      {id:id(),name:'ECE 105 – Classical Mechanics',day:'Fri',start:'10:30',end:'11:20',loc:'PHY 313',color:'#2b9720'},
      {id:id(),name:'ECE 140 – Lab',day:'Fri',start:'14:30',end:'16:50',loc:'E3 2369',color:'#2b9720'},
    ];
  },

  methods: {
    addClass(c){ if(!c.name||!c.name.trim())return; this.save(d=>{ d.classes.push({id:this.uid(),color:'#2b9720',...c,name:c.name.trim()}); }); this.setState({addingClass:false}); },
    delClass(id){ this.save(d=>{ d.classes=d.classes.filter(x=>x.id!==id); }); },
  },

  render(ctx) {
    var d=ctx.d, days=ctx.days, dayFull=ctx.dayFull, todayKey=ctx.todayKey, rv=ctx.rv, clr=ctx.clr, refs=ctx.refs;
    var week=days.map(function(k){
      var cs=d.classes.filter(function(c){return c.day===k;}).sort(function(a,b){return a.start.localeCompare(b.start);}).map(function(c){
        return {name:c.name,loc:c.loc,color:c.color,range:c.start+'–'+c.end,del:()=>this.delClass(c.id)};
      }.bind(this));
      return {key:k,name:dayFull[k],isToday:k===todayKey,classes:cs,hasClasses:cs.length>0,empty:cs.length===0,
        nameStyle:'font-family:\'Newsreader\',serif;font-size:18px;color:'+(k===todayKey?'#2b9720':'#343a1a')+';'};
    }.bind(this));
    var addClassNow=()=>{ var n=rv('cName'); if(!n.trim())return; this.addClass({name:n,day:rv('cDay')||'Mon',start:rv('cStart')||'09:00',end:rv('cEnd')||'09:50',loc:rv('cLoc'),color:'#2b9720'}); clr('cName','cLoc'); };
    return {
      week, addingClass:this.state.addingClass,
      addClassLabel:this.state.addingClass?'Close':'+ Add class',
      toggleAddClass:()=>this.setState({addingClass:!this.state.addingClass}),
      dayOptions:days, addClassNow,
      refCName:refs.cName, refCDay:refs.cDay, refCStart:refs.cStart, refCEnd:refs.cEnd, refCLoc:refs.cLoc,
    };
  },
};
