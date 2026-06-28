var RecipesSection = {
  refs: ['rType', 'rName', 'rTime', 'rIng', 'rSteps'],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    return [
      {id:id(),type:'food',name:'Microwave mug omelette',time:'5 min',
        ingredients:['2 eggs','Splash of milk','Shredded cheese','Salt + pepper','Diced ham or spinach'],
        steps:['Beat eggs + milk in a mug','Stir in cheese and add-ins','Microwave 1 min, stir','Microwave 45s more until set']},
      {id:id(),type:'food',name:'Dorm ramen upgrade',time:'10 min',
        ingredients:['1 pack instant ramen','1 egg','Handful frozen veg','Soy sauce','Sriracha'],
        steps:['Boil noodles + veg 3 min','Crack egg in, stir gently','Add half the seasoning','Top with soy + sriracha']},
      {id:id(),type:'food',name:'No-cook overnight oats',time:'2 min + overnight',
        ingredients:['1/2 cup oats','1/2 cup milk','1 tbsp peanut butter','Honey','Banana'],
        steps:['Mix oats + milk in a jar','Stir in PB + honey','Fridge overnight','Top with banana']},
      {id:id(),type:'drink',name:'Iced brown sugar latte',time:'5 min',
        ingredients:['1 shot coffee / espresso','1 tbsp brown sugar','Splash hot water','Milk','Ice'],
        steps:['Dissolve sugar in hot water','Add coffee, stir','Fill glass with ice + milk','Pour over and stir']},
      {id:id(),type:'drink',name:'Electrolyte study water',time:'2 min',
        ingredients:['Cold water','Pinch of salt','Squeeze of lemon','1 tsp honey'],
        steps:['Combine in bottle','Shake well','Sip during late-night study']},
    ];
  },

  methods: {
    addRecipe(r){ if(!r.name||!r.name.trim())return; this.save(d=>{ d.recipes.push({id:this.uid(),type:r.type||'food',name:r.name.trim(),time:r.time||'',img:r.img||null,ingredients:r.ingredients||[],steps:r.steps||[]}); }); this.setState({addingRecipe:false,recipeImgDraft:null}); },
    setRecipeImgDraft(files){ const f=files&&files[0]; if(!f)return; const r=new FileReader(); r.onload=e=>this.setState({recipeImgDraft:e.target.result}); r.readAsDataURL(f); },
    delRecipe(id){ const rec=this.state.data.recipes.find(x=>x.id===id); this.save(d=>{ if(rec){ d.trash.push({id:this.uid(),type:'recipe',name:rec.name,item:rec,deletedAt:Date.now()}); } d.recipes=d.recipes.filter(x=>x.id!==id); }); this.setState({recipeOpen:null,editRecipe:null,editRecipeImgDraft:null}); },
    updateRecipeInData(id,changes){ this.save(d=>{ const r=d.recipes.find(x=>x.id===id); if(r) Object.assign(r,changes); }); },
    startEditRecipe(id){ const r=this.state.data.recipes.find(x=>x.id===id); if(!r)return; this.setState({editRecipe:{id:r.id,type:r.type,name:r.name,time:r.time,ingredients:r.ingredients.join('\n'),steps:r.steps.join('\n')},editRecipeImgDraft:r.img||null}); },
    cancelEditRecipe(){ this.setState({editRecipe:null,editRecipeImgDraft:null}); },
    updateRecipeField(field,val){ this.setState({editRecipe:{...this.state.editRecipe,[field]:val}}); },
    saveEditRecipe(){ const er=this.state.editRecipe; if(!er)return; this.updateRecipeInData(er.id,{name:er.name.trim(),type:er.type,time:er.time,img:this.state.editRecipeImgDraft,ingredients:er.ingredients.split('\n').map(s=>s.trim()).filter(Boolean),steps:er.steps.split('\n').map(s=>s.trim()).filter(Boolean)}); this.setState({editRecipe:null,editRecipeImgDraft:null}); },
  },

  render(ctx) {
    var d=ctx.d, screen=ctx.screen, rv=ctx.rv, clr=ctx.clr, refs=ctx.refs;
    var isS=(k)=>screen===k;
    var recipeTab=this.state.recipeTab;
    var tabStyle=(on)=>`padding:9px 20px;border-radius:11px;font-size:14px;font-weight:600;cursor:pointer;background:${on?'#d4845a':'transparent'};color:${on?'#fff5ef':'#a04530'};`;
    var recipesList=d.recipes.filter(r=>r.type===recipeTab).map(r=>({id:r.id,name:r.name,time:r.time,ingCount:r.ingredients.length+' ingredients',open:()=>this.setState({recipeOpen:r.id})}));
    var ro=d.recipes.find(r=>r.id===this.state.recipeOpen);
    var openRecipe=ro?{id:ro.id,name:ro.name,time:ro.time,img:ro.img||null,hasImg:!!ro.img,ingredients:ro.ingredients,steps:ro.steps.map((t,i)=>({num:i+1,text:t})),del:()=>this.delRecipe(ro.id),close:()=>this.setState({recipeOpen:null,editRecipe:null,editRecipeImgDraft:null}),edit:()=>this.startEditRecipe(ro.id)}:null;
    var er=this.state.editRecipe;
    var editRecipeData=er?{name:er.name,type:er.type,time:er.time,ingredients:er.ingredients,steps:er.steps,img:this.state.editRecipeImgDraft,hasImg:!!this.state.editRecipeImgDraft,setName:(e)=>this.updateRecipeField('name',e.target.value),setType:(e)=>this.updateRecipeField('type',e.target.value),setTime:(e)=>this.updateRecipeField('time',e.target.value),setIngredients:(e)=>this.updateRecipeField('ingredients',e.target.value),setSteps:(e)=>this.updateRecipeField('steps',e.target.value),save:()=>this.saveEditRecipe(),cancel:()=>this.cancelEditRecipe(),onImgChange:(e)=>{const f=e.target.files&&e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=ev=>this.setState({editRecipeImgDraft:ev.target.result});fr.readAsDataURL(f);e.target.value='';},clearImg:()=>this.setState({editRecipeImgDraft:null})}:null;
    var addRecipeNow=()=>{ const n=rv('rName'); if(!n.trim())return; this.addRecipe({type:rv('rType')||'food',name:n,time:rv('rTime'),img:this.state.recipeImgDraft,ingredients:rv('rIng').split('\n').map(s=>s.trim()).filter(Boolean),steps:rv('rSteps').split('\n').map(s=>s.trim()).filter(Boolean)}); clr('rName','rTime','rIng','rSteps'); };
    return {
      recipeTab,
      tabFoodStyle:tabStyle(recipeTab==='food'), tabDrinkStyle:tabStyle(recipeTab==='drink'),
      recTabFood:()=>this.setState({recipeTab:'food',recipeOpen:null}),
      recTabDrink:()=>this.setState({recipeTab:'drink',recipeOpen:null}),
      recipesList, openRecipe, editRecipeData,
      showRecipeList:isS('recipes')&&!openRecipe&&!er,
      recipeDetailShown:isS('recipes')&&!!openRecipe&&!er,
      editingRecipeShown:isS('recipes')&&!!er&&!!this.state.recipeOpen,
      addingRecipe:this.state.addingRecipe,
      showAddRecipe:()=>this.setState({addingRecipe:true}),
      hideAddRecipe:()=>this.setState({addingRecipe:false}),
      addRecipeNow,
      refRType:refs.rType, refRName:refs.rName, refRTime:refs.rTime, refRIng:refs.rIng, refRSteps:refs.rSteps,
      recipeImgDraft:this.state.recipeImgDraft, hasRecipeImgDraft:!!this.state.recipeImgDraft,
      onRecipeImgChange:(e)=>{this.setRecipeImgDraft(e.target.files);e.target.value='';},
      clearRecipeImg:()=>this.setState({recipeImgDraft:null}),
    };
  },
};
