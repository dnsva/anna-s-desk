var PhotosSection = {
  refs: [],

  seed() { return []; },

  _autoPos(idx) {
    var cols = [5, 37, 68];
    return {
      x: Math.max(0, Math.min(62, cols[idx % 3] + (idx * 13.7 % 6) - 3)),
      y: Math.max(0, Math.floor(idx / 3) * 38 + 5 + (idx * 7.3 % 6) - 3),
      rot: 0,
    };
  },

  methods: {
    addPhotos(files) {
      if (!files || !files.length) return;
      Array.from(files).forEach(f => {
        const r = new FileReader();
        r.onload = e => {
          this.save(d => {
            const idx = d.photos.length;
            const pos = PhotosSection._autoPos(idx);
            const maxZ = d.photos.reduce((m, p) => Math.max(m, p.z || 1), 0);
            d.photos.push({ id: this.uid(), src: e.target.result, caption: '', x: pos.x, y: pos.y, w: 33, rot: 0, z: maxZ + 1 });
          });
        };
        r.readAsDataURL(f);
      });
    },

    setCaption(id, v) { this.save(d => { const p = d.photos.find(x => x.id === id); if (p) p.caption = v; }); },

    delPhoto(id) {
      this.save(d => {
        const p = d.photos.find(x => x.id === id);
        if (p) {
          d.trash = d.trash || [];
          d.trash.push({ id: p.id, name: p.caption || 'Photo', type: 'photo', deletedAt: Date.now(), item: p });
        }
        d.photos = d.photos.filter(x => x.id !== id);
      });
    },

    rotatePhoto(id, delta) {
      this.save(d => { const p = d.photos.find(x => x.id === id); if (p) p.rot = ((p.rot || 0) + delta + 360) % 360; });
    },

    startPhotoDrag(id, e) {
      e.preventDefault();
      const board = document.getElementById('photo-board');
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const dd = this.state.data;
      const photo = dd.photos.find(p => p.id === id);
      if (!photo) return;
      const photoIdx = dd.photos.indexOf(photo);
      const autoP = PhotosSection._autoPos(photoIdx);
      const origX = photo.x != null ? photo.x : autoP.x;
      const origY = photo.y != null ? photo.y : autoP.y;
      const photoW = photo.w || 33;
      const startCX = e.clientX;
      const startCY = e.clientY;
      const maxZ = dd.photos.reduce((m, p) => Math.max(m, p.z || 1), 0);
      this.save(d => {
        const p = d.photos.find(p => p.id === id);
        if (p) { p.z = maxZ + 1; if (p.x == null) { p.x = origX; p.y = origY; } }
      });
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const onMove = (me) => {
        me.preventDefault();
        const dx = ((me.clientX - startCX) / rect.width) * 100;
        const dy = ((me.clientY - startCY) / rect.height) * 100;
        const newX = clamp(origX + dx, 0, 100 - photoW);
        const newY = clamp(origY + dy, 0, 85);
        this.setState(s => ({ photoDragLive: { ...s.photoDragLive, [id]: { x: newX, y: newY } } }));
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        const live = this.state.photoDragLive && this.state.photoDragLive[id];
        if (live) {
          this.save(d => { const p = d.photos.find(p => p.id === id); if (p) { p.x = live.x; p.y = live.y; } });
          this.setState(s => { const pl = { ...s.photoDragLive }; delete pl[id]; return { photoDragLive: pl }; });
        }
      };
      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onUp);
    },

    startPhotoResize(id, e) {
      e.preventDefault();
      e.stopPropagation();
      const board = document.getElementById('photo-board');
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const dd = this.state.data;
      const photo = dd.photos.find(p => p.id === id);
      if (!photo) return;
      const photoIdx = dd.photos.indexOf(photo);
      const autoP = PhotosSection._autoPos(photoIdx);
      const photoX = photo.x != null ? photo.x : autoP.x;
      const cardLeftPx = rect.left + (photoX / 100) * rect.width;
      const onMove = (me) => {
        me.preventDefault();
        const newW = Math.max(10, Math.min(90, ((me.clientX - cardLeftPx) / rect.width) * 100));
        this.setState(s => ({ photoResizeLive: { ...s.photoResizeLive, [id]: newW } }));
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        const liveW = this.state.photoResizeLive && this.state.photoResizeLive[id];
        if (liveW != null) {
          this.save(d => { const p = d.photos.find(p => p.id === id); if (p) p.w = liveW; });
          this.setState(s => { const pl = { ...s.photoResizeLive }; delete pl[id]; return { photoResizeLive: pl }; });
        }
      };
      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onUp);
    },
  },

  render(ctx) {
    var d = ctx.d, state = ctx.state, w = ctx.w, screen = ctx.screen;
    var isS = (k) => screen === k;
    var dragLive = state.photoDragLive || {};
    var resizeLive = state.photoResizeLive || {};
    var boardH = w < 700 ? Math.max(600, w * 1.6) : w < 1000 ? Math.max(750, w * 1.3) : 900;
    var boardStyle = 'position:relative;height:' + boardH + 'px;width:100%;' +
      'background:repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(196,144,120,.06) 29px),' +
      'repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(196,144,120,.06) 29px),#fff5f0;' +
      'border-radius:18px;border:1px solid #e5c4b8;overflow:visible;';
    var stopProp = (e) => e.stopPropagation();
    var photosList = d.photos.map((p, i) => {
      var lp = dragLive[p.id];
      var autoP = PhotosSection._autoPos(i);
      var x = lp ? lp.x : (p.x != null ? p.x : autoP.x);
      var y = lp ? lp.y : (p.y != null ? p.y : autoP.y);
      var pw = (resizeLive[p.id] != null) ? resizeLive[p.id] : (p.w || 33);
      var z = p.z || (i + 1);
      var isDragging = !!lp;
      var isResizing = resizeLive[p.id] != null;
      var rot = p.rot || 0;
      return {
        id: p.id, src: p.src,
        hasSrc: !!(p.src && p.src.length > 4),
        caption: p.caption,
        del: () => this.delPhoto(p.id),
        setCap: (e) => this.setCaption(p.id, e.target.value),
        onDragStart: (e) => this.startPhotoDrag(p.id, e),
        onResizeStart: (e) => this.startPhotoResize(p.id, e),
        rotCCW: (e) => { e.stopPropagation(); this.rotatePhoto(p.id, -90); },
        rotCW: (e) => { e.stopPropagation(); this.rotatePhoto(p.id, 90); },
        stopProp,
        cardStyle: 'position:absolute;left:' + x + '%;top:' + y + '%;width:' + pw + '%;' +
          'z-index:' + z + ';' +
          'transform:rotate(' + rot + 'deg);' +
          'background:#fff2ee;border:1px solid #e5c4b8;border-radius:16px;padding:0 0 8px;' +
          'box-shadow:' + ((isDragging || isResizing) ? '0 16px 40px rgba(61,35,20,.35)' : '0 4px 18px rgba(61,35,20,.18)') + ';' +
          'transition:' + ((isDragging || isResizing) ? 'none' : 'box-shadow .2s,transform .15s') + ';',
      };
    });
    var addPhotosNow = (e) => { this.addPhotos(e.target.files); e.target.value = ''; };
    return {
      photosList,
      photosEmpty: isS('photos') && d.photos.length === 0,
      photosHas: d.photos.length > 0,
      boardStyle,
      addPhotosNow,
    };
  },
};
