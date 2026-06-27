var PhotosSection = {
  refs: [],

  seed() {
    return [];
  },

  methods: {
    addPhotos(files){ if(!files||!files.length)return; Array.from(files).forEach(f=>{ const r=new FileReader(); r.onload=e=>{ this.save(d=>{ d.photos.unshift({id:this.uid(),src:e.target.result,caption:''}); }); }; r.readAsDataURL(f); }); },
    setCaption(id,v){ this.save(d=>{ const p=d.photos.find(x=>x.id===id); if(p) p.caption=v; }); },
    delPhoto(id){ this.save(d=>{ d.photos=d.photos.filter(x=>x.id!==id); }); },
  },

  render(ctx) {
    var d=ctx.d, screen=ctx.screen, w=ctx.w;
    var isS=(k)=>screen===k;
    var photosList=d.photos.map(p=>({id:p.id,src:p.src,hasSrc:!!(p.src&&p.src.length>4),caption:p.caption,
      del:()=>this.delPhoto(p.id),setCap:(e)=>this.setCaption(p.id,e.target.value)}));
    var addPhotosNow=(e)=>{ this.addPhotos(e.target.files); e.target.value=''; };
    var photoCols=w>=900?4:w>=560?3:2;
    return {
      photosList, photosEmpty:isS('photos')&&d.photos.length===0, photosHas:d.photos.length>0,
      photoColStyle:'column-count:'+photoCols+';column-gap:14px;', addPhotosNow,
    };
  },
};
