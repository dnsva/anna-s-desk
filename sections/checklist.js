var ChecklistSection = {
  refs: ['clText', 'clCat'],

  seed() {
    var id = function() { return Math.random().toString(36).slice(2,8); };
    return [
      // Admin & Accounts
      {id:id(),cat:'Admin & Accounts',label:'Activate WatIAM account',done:true},
      {id:id(),cat:'Admin & Accounts',label:'Log in to Quest (fees, grades, enrollment)',done:true},
      {id:id(),cat:'Admin & Accounts',label:'Set up LEARN (online course platform)',done:false},
      {id:id(),cat:'Admin & Accounts',label:'Register on WaterlooWorks (co-op portal)',done:false},
      {id:id(),cat:'Admin & Accounts',label:'Pick up WatCard (student ID + access card)',done:false},
      {id:id(),cat:'Admin & Accounts',label:'Enroll in or opt out of student health plan',done:false},
      {id:id(),cat:'Admin & Accounts',label:'Set up Duo two-factor authentication',done:false},
      {id:id(),cat:'Admin & Accounts',label:'Confirm OSAP / financial aid disbursement',done:false},
      // Residence
      {id:id(),cat:'Residence',label:'Twin XL sheets × 2 sets',done:true},
      {id:id(),cat:'Residence',label:'Comforter + pillows × 2',done:true},
      {id:id(),cat:'Residence',label:'Mattress topper',done:false},
      {id:id(),cat:'Residence',label:'Bath towels × 3 + washcloths × 3',done:false},
      {id:id(),cat:'Residence',label:'Shower caddy + flip flops (shared showers)',done:false},
      {id:id(),cat:'Residence',label:'Ethernet cable — REZ rooms have wired internet',done:false},
      {id:id(),cat:'Residence',label:'Laundry bag + detergent pods (card-operated machines)',done:false},
      {id:id(),cat:'Residence',label:'Command strips + hooks (no nails allowed)',done:false},
      // Clothing
      {id:id(),cat:'Clothing — Tops',label:'T-shirts × 8',done:false},
      {id:id(),cat:'Clothing — Tops',label:'Long-sleeve shirts × 4',done:false},
      {id:id(),cat:'Clothing — Tops',label:'Hoodies / sweatshirts × 3',done:false},
      {id:id(),cat:'Clothing — Tops',label:'Sweaters × 2',done:false},
      {id:id(),cat:'Clothing — Tops',label:'Athletic / workout tops × 5',done:false},
      {id:id(),cat:'Clothing — Tops',label:'Smart-casual tops × 2 (ECE events, presentations)',done:false},
      {id:id(),cat:'Clothing — Bottoms & Undergarments',label:'Underwear × 14 (2 full weeks)',done:false},
      {id:id(),cat:'Clothing — Bottoms & Undergarments',label:'Regular socks × 14 pairs',done:false},
      {id:id(),cat:'Clothing — Bottoms & Undergarments',label:'Warm / wool socks × 5 pairs',done:false},
      {id:id(),cat:'Clothing — Bottoms & Undergarments',label:'Jeans × 2',done:false},
      {id:id(),cat:'Clothing — Bottoms & Undergarments',label:'Joggers / casual pants × 2',done:false},
      {id:id(),cat:'Clothing — Bottoms & Undergarments',label:'Athletic shorts × 2',done:false},
      {id:id(),cat:'Clothing — Bottoms & Undergarments',label:'Dress pants × 1 (co-op interviews)',done:false},
      {id:id(),cat:'Clothing — Outerwear & Footwear',label:'Heavy winter coat (Waterloo gets cold in Oct)',done:false},
      {id:id(),cat:'Clothing — Outerwear & Footwear',label:'Rain jacket (Waterloo has 150+ rain days/yr)',done:false},
      {id:id(),cat:'Clothing — Outerwear & Footwear',label:'Light fall jacket / fleece',done:false},
      {id:id(),cat:'Clothing — Outerwear & Footwear',label:'Toque × 2 + gloves × 2 pairs + scarf',done:false},
      {id:id(),cat:'Clothing — Outerwear & Footwear',label:'Waterproof winter boots',done:false},
      {id:id(),cat:'Clothing — Outerwear & Footwear',label:'Everyday sneakers',done:false},
      {id:id(),cat:'Clothing — Outerwear & Footwear',label:'Gym / running shoes',done:false},
      {id:id(),cat:'Clothing — Outerwear & Footwear',label:'Dress shoes (co-op interviews, formals)',done:false},
      {id:id(),cat:'Sleepwear',label:'Pajama sets × 3',done:false},
      {id:id(),cat:'Sleepwear',label:'Bathrobe (optional but great in REZ)',done:false},
      // Class Supplies
      {id:id(),cat:'Class Supplies',label:'Lined notebooks × 3 (ECE 105, ECE 140, MATH 117)',done:false},
      {id:id(),cat:'Class Supplies',label:'Graph / engineering paper pad',done:false},
      {id:id(),cat:'Class Supplies',label:'CASIO fx-991 calculator (non-programmable, exam-approved)',done:true},
      {id:id(),cat:'Class Supplies',label:'Backpack',done:true},
      {id:id(),cat:'Class Supplies',label:'Highlighters + pens + pencils',done:true},
      {id:id(),cat:'Class Supplies',label:'USB drive',done:false},
      {id:id(),cat:'Class Supplies',label:'Binder + dividers (for MATH 117 / ECE 105 notes)',done:false},
      // Electronics & Tech
      {id:id(),cat:'Electronics & Tech',label:'Laptop + charger',done:true},
      {id:id(),cat:'Electronics & Tech',label:'Power bar + extension cord',done:false},
      {id:id(),cat:'Electronics & Tech',label:'Desk lamp',done:false},
      {id:id(),cat:'Electronics & Tech',label:'USB-C hub / dongles',done:false},
      {id:id(),cat:'Electronics & Tech',label:'Wired earbuds (library / exam quiet)',done:false},
      {id:id(),cat:'Electronics & Tech',label:'Wireless earbuds (between buildings)',done:false},
      {id:id(),cat:'Electronics & Tech',label:'Portable power bank',done:false},
      // Kitchen
      {id:id(),cat:'Kitchen',label:'Electric kettle (allowed in REZ rooms)',done:false},
      {id:id(),cat:'Kitchen',label:'Mugs × 2',done:false},
      {id:id(),cat:'Kitchen',label:'Reusable water bottle',done:true},
      {id:id(),cat:'Kitchen',label:'Reusable utensil set (fork, knife, spoon, chopsticks)',done:false},
      {id:id(),cat:'Kitchen',label:'Snack bin / pantry box',done:false},
      // Personal & Health
      {id:id(),cat:'Personal & Health',label:'OHIP card + vaccination records',done:false},
      {id:id(),cat:'Personal & Health',label:'Prescription meds + OTC basics (ibuprofen, antihistamine)',done:false},
      {id:id(),cat:'Personal & Health',label:'First aid kit (bandaids, thermometer)',done:false},
      {id:id(),cat:'Personal & Health',label:'Shampoo + conditioner + body wash + loofah',done:false},
      {id:id(),cat:'Personal & Health',label:'Deodorant (stock up)',done:false},
      {id:id(),cat:'Personal & Health',label:'Skincare routine products',done:false},
      {id:id(),cat:'Personal & Health',label:'Toothbrush + toothpaste + floss',done:false},
      {id:id(),cat:'Personal & Health',label:'Hair dryer',done:false},
      {id:id(),cat:'Personal & Health',label:'Nail clipper + grooming kit',done:false},
      {id:id(),cat:'Personal & Health',label:'Something from home (comfort item)',done:false},
    ];
  },

  methods: {
    toggleItem(id){ this.save(d=>{ const it=d.checklist.find(x=>x.id===id); if(it) it.done=!it.done; }); },
    addItem(cat,label){ if(!label||!label.trim())return; this.save(d=>{ d.checklist.push({id:this.uid(),cat,label:label.trim(),done:false}); }); },
    delItem(id){ this.save(d=>{ const it=d.checklist.find(x=>x.id===id); if(it){ d.trash.push({id:this.uid(),type:'checklist',name:it.label,item:it,deletedAt:Date.now()}); d.checklist=d.checklist.filter(x=>x.id!==id); } }); },
  },

  render(ctx) {
    var d=ctx.d, rv=ctx.rv, clr=ctx.clr, enter=ctx.enter, refs=ctx.refs;
    var catOrder=['Admin & Accounts','Residence','Clothing — Tops','Clothing — Bottoms & Undergarments','Clothing — Outerwear & Footwear','Sleepwear','Class Supplies','Electronics & Tech','Kitchen','Personal & Health'];
    var catOptions=[].concat(catOrder,d.checklist.map(function(x){return x.cat;})).filter(function(v,i,a){return a.indexOf(v)===i;});
    var checklistGroups=catOptions.map(function(cat){
      return {cat:cat,catUpper:cat.toUpperCase(),items:d.checklist.filter(function(x){return x.cat===cat;}).map(function(it){
        return {id:it.id,label:it.label,done:it.done,
          toggle:()=>this.toggleItem(it.id),del:()=>this.delItem(it.id),
          boxStyle:'width:22px;height:22px;flex:none;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;border:2px solid '+(it.done?'#8b1e3f':'#7dcece')+';background:'+(it.done?'#8b1e3f':'transparent')+';',
          labelStyle:'flex:1;font-size:15px;color:'+(it.done?'#5a8a3a':'#343a1a')+';text-decoration:'+(it.done?'line-through':'none')+';'};
      }.bind(this))};
    }.bind(this)).filter(function(g){return g.items.length;});
    var packDone=d.checklist.filter(function(x){return x.done;}).length;
    var packPct=Math.round(packDone/Math.max(1,d.checklist.length)*100);
    var addCLnow=()=>{ var t=rv('clText'); if(!t.trim())return; this.addItem(rv('clCat')||catOptions[0],t); clr('clText'); };
    return {
      checklistGroups, packPct, packText:packDone+' of '+d.checklist.length+' packed', catOptions,
      refClText:refs.clText, refClCat:refs.clCat, addCLnow, onAddCLKey:enter(addCLnow),
    };
  },
};
