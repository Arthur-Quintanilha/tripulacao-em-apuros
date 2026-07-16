const InventorySystem = {
  MAX_SLOTS: 6,
  items: [],
  equipped: null,
  initialized: false,
  onEquipChange: null,

  ITEMS: {
    knife: {
      id: 'knife',
      name: 'Canivete',
      description: 'Canivete enferrujado deixado pelo marujo. Clique para equipar.',
      icon: 'assets/items/knife.png',
      hand: true
    },
    keys: {
      id: 'keys',
      name: 'Chaves',
      description: 'Chaves dos botes de emergência do navio.',
      icon: 'assets/items/keys.png',
      hand: false
    }
  },

  init() {
    if (this.initialized) return;

    this.panel = document.getElementById('inventory-panel');
    this.slotsEl = document.getElementById('inventory-slots');
    this.tooltip = document.getElementById('inventory-tooltip');
    this.tooltipName = document.getElementById('inventory-tooltip-name');
    this.tooltipDesc = document.getElementById('inventory-tooltip-desc');

    this.initialized = true;
    this.render();
  },

  reset() {
    this.items = [];
    this.equipped = null;
    if (!this.initialized) return;
    this.hideTooltip();
    this.render();
    this._notifyEquipChange();
  },

  has(id) {
    return this.items.includes(id);
  },

  isEquipped(id) {
    return this.equipped === id;
  },

  toggleEquip(id) {
    if (!this.has(id) || !this.ITEMS[id]?.hand) return;

    this.equipped = this.equipped === id ? null : id;
    this.render();
    this._notifyEquipChange();
  },

  _notifyEquipChange() {
    if (this.onEquipChange) {
      this.onEquipChange(this.equipped);
    }
  },

  addItem(id) {
    if (!this.ITEMS[id] || this.items.includes(id)) return;

    this.init();
    this.items.push(id);
    if (this.ITEMS[id].hand && !this.equipped) {
      this.equipped = id;
      this._notifyEquipChange();
    }
    this.render(id);
  },

  render(newItemId) {
    if (!this.initialized) return;

    this.slotsEl.innerHTML = '';

    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';

      const itemId = this.items[i];
      if (itemId) {
        const item = this.ITEMS[itemId];
        slot.classList.add('inventory-slot-filled');
        if (this.equipped === itemId) {
          slot.classList.add('inventory-slot-equipped');
        }

        const img = document.createElement('img');
        img.src = item.icon;
        img.alt = item.name;
        img.draggable = false;
        slot.appendChild(img);

        if (itemId === newItemId) {
          slot.classList.add('inventory-slot-new');
        }

        slot.addEventListener('click', () => {
          if (item.hand) {
            this.toggleEquip(itemId);
          }
        });
        slot.addEventListener('mouseenter', () => this.showTooltip(item, slot));
        slot.addEventListener('mouseleave', () => this.hideTooltip());
      }

      this.slotsEl.appendChild(slot);
    }
  },

  showTooltip(item, slot) {
    const equipped = this.isEquipped(item.id);
    this.tooltipName.textContent = equipped ? `${item.name} (equipado)` : item.name;
    this.tooltipDesc.textContent = item.description;
    this.tooltip.classList.remove('hidden');
  },

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.add('hidden');
    }
  }
};
