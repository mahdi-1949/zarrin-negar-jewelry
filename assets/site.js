
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileClose = document.querySelector('.mobile-close');
    const menuBackdrop = document.querySelector('.menu-backdrop');
    const mobileAccordionTrigger = document.querySelector('.mobile-accordion-trigger');
    const mobileSubnav = document.querySelector('.mobile-subnav');
    const megaItem = document.querySelector('.nav-item.has-mega');
    const megaTrigger = document.querySelector('.nav-trigger');
    const toast = document.querySelector('.toast');
    let toastTimer;
    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
    }
    function setMobileMenu(open, returnFocus = false) {
      mobileNav.classList.toggle('open', open);
      document.querySelector('.site-header').classList.toggle('menu-open', open);
      document.body.classList.toggle('menu-open', open);
      menuBackdrop.hidden = !open;
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
      if (!open) {
        mobileSubnav.hidden = true;
        mobileAccordionTrigger.setAttribute('aria-expanded', 'false');
        if (returnFocus) menuToggle.focus();
      } else {
        mobileClose.focus();
      }
    }
    function closeMegaMenu(returnFocus = false) {
      megaItem.classList.remove('is-open');
      megaItem.classList.add('is-dismissed');
      megaTrigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) megaTrigger.focus();
    }
    megaTrigger.addEventListener('click', () => {
      const isOpen = megaItem.classList.contains('is-open');
      megaItem.classList.toggle('is-open', !isOpen);
      megaItem.classList.toggle('is-dismissed', isOpen);
      megaTrigger.setAttribute('aria-expanded', String(!isOpen));
    });
    megaItem.addEventListener('pointerleave', () => {
      if (!megaItem.classList.contains('is-open')) megaItem.classList.remove('is-dismissed');
    });
    megaItem.addEventListener('focusout', event => {
      if (!megaItem.contains(event.relatedTarget)) closeMegaMenu();
    });
    document.addEventListener('pointerdown', event => {
      if (!megaItem.contains(event.target)) closeMegaMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && megaItem.classList.contains('is-open')) closeMegaMenu(true);
    });
    megaItem.querySelectorAll('.mega-menu a').forEach(link => link.addEventListener('click', () => closeMegaMenu()));
    menuToggle.addEventListener('click', () => setMobileMenu(!mobileNav.classList.contains('open')));
    mobileClose.addEventListener('click', () => setMobileMenu(false, true));
    menuBackdrop.addEventListener('click', () => setMobileMenu(false, true));
    mobileAccordionTrigger.addEventListener('click', () => {
      const isOpen = mobileAccordionTrigger.getAttribute('aria-expanded') === 'true';
      mobileAccordionTrigger.setAttribute('aria-expanded', String(!isOpen));
      mobileSubnav.hidden = isOpen;
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMobileMenu(false, true)));
    document.addEventListener('keydown', event => {
      if (!mobileNav.classList.contains('open')) return;
      if (event.key === 'Escape') {
        setMobileMenu(false, true);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...mobileNav.querySelectorAll('a[href], button:not([disabled])')].filter(el => !el.closest('[hidden]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 960 && mobileNav.classList.contains('open')) setMobileMenu(false);
    });
    const WISH_KEY = 'zarrinnegar-wishlist';
    const readWishlist = () => {
      try { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]').filter(value => typeof value === 'string'); } catch { return []; }
    };
    const saveWishlist = wishlist => { try { localStorage.setItem(WISH_KEY, JSON.stringify([...wishlist])); } catch {} };
    const wishSet = new Set(readWishlist());
    document.querySelectorAll('.wish-button').forEach(button => {
      const item = button.closest('[data-id]');
      const id = item?.dataset.id;
      const active = Boolean(id && wishSet.has(id));
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      button.addEventListener('click', () => {
        if (!id) return;
        const isActive = !wishSet.has(id);
        if (isActive) wishSet.add(id); else wishSet.delete(id);
        saveWishlist(wishSet);
        document.querySelectorAll('.wish-button').forEach(other => {
          if (other.closest('[data-id]')?.dataset.id !== id) return;
          other.classList.toggle('active', isActive);
          other.setAttribute('aria-pressed', String(isActive));
        });
        showToast(isActive ? 'به علاقه‌مندی‌های شما اضافه شد.' : 'از علاقه‌مندی‌های شما حذف شد.');
      });
    });

    const searchButton = document.querySelector('.search-button');
    let searchIndexPromise;
    function loadSearchIndex() {
      if (!searchIndexPromise) {
        searchIndexPromise = fetch(new URL('products.html', window.location.href))
          .then(response => { if (!response.ok) throw new Error('search index unavailable'); return response.text(); })
          .then(markup => {
            const documentCopy = new DOMParser().parseFromString(markup, 'text/html');
            return [...documentCopy.querySelectorAll('.catalog-item')].map(item => ({
              id:item.dataset.id, name:item.dataset.name, category:item.dataset.category,
              image:item.querySelector('.product-image-wrap img')?.getAttribute('src') || '',
              weight:item.querySelector('.product-weight')?.textContent.trim() || '',
              price:item.querySelector('.product-price')?.textContent.trim() || '',
              href:item.querySelector('.product-title a')?.getAttribute('href') || 'product.html'
            }));
          }).catch(() => [...document.querySelectorAll('.product-card[data-name]')].map(item => ({
            id:item.dataset.id, name:item.dataset.name, category:item.dataset.category,
            image:item.querySelector('.product-image-wrap img')?.getAttribute('src') || '',
            weight:item.querySelector('.product-weight')?.textContent.trim() || '',
            price:item.querySelector('.product-price')?.textContent.trim() || '', href:'product.html'
          })));
      }
      return searchIndexPromise;
    }
    if (searchButton) {
      const dialog = document.createElement('dialog');
      dialog.className = 'search-dialog';
      dialog.setAttribute('aria-labelledby', 'search-dialog-title');
      dialog.innerHTML = `<div class="search-dialog-inner" dir="rtl">
        <div class="search-dialog-head"><div><span>فروشگاه زرین‌نگار</span><strong id="search-dialog-title">دنبال چه چیزی می‌گردید؟</strong></div><button class="search-close" type="button" aria-label="بستن جست‌وجو">×</button></div>
        <form class="search-form" role="search"><label class="search-input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input type="search" placeholder="نام محصول را جست‌وجو کنید" autocomplete="off" aria-label="جست‌وجوی محصولات"></label></form>
        <div class="search-shortcuts" aria-label="جست‌وجو بر اساس دسته‌بندی"><button type="button" data-search-shortcut="انگشتر">انگشتر</button><button type="button" data-search-shortcut="گردنبند">گردنبند</button><button type="button" data-search-shortcut="گوشواره">گوشواره</button><button type="button" data-search-shortcut="دستبند">دستبند</button></div>
        <div class="search-results" role="listbox" aria-label="نتایج جست‌وجو"><p class="search-empty">نام محصول یا یکی از دسته‌بندی‌ها را انتخاب کنید.</p></div>
      </div>`;
      document.body.append(dialog);
      const searchInput = dialog.querySelector('input[type="search"]');
      const searchResults = dialog.querySelector('.search-results');
      let searchRenderToken = 0;
      async function renderSearchResults() {
        const token = ++searchRenderToken;
        const query = searchInput.value.trim().toLocaleLowerCase('fa');
        if (!query) { searchResults.innerHTML = '<p class="search-empty">نام محصول یا یکی از دسته‌بندی‌ها را انتخاب کنید.</p>'; return; }
        const records = await loadSearchIndex();
        if (token !== searchRenderToken) return;
        const matches = records.filter(item => `${item.name} ${item.category} ${item.weight}`.toLocaleLowerCase('fa').includes(query)).slice(0,8);
        if (!matches.length) { searchResults.innerHTML = '<p class="search-empty">محصولی با این عبارت پیدا نشد. نام دیگری را امتحان کنید.</p>'; return; }
        searchResults.innerHTML = matches.map(item => `<a class="search-result" role="option" href="${escapeHTML(item.href)}"><img src="${escapeHTML(item.image)}" alt="" loading="lazy"><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.weight)}</small></span><span class="search-result-price">${escapeHTML(item.price)}</span></a>`).join('');
      }
      searchInput.addEventListener('input', renderSearchResults);
      dialog.querySelectorAll('[data-search-shortcut]').forEach(button => button.addEventListener('click', () => {
        searchInput.value = button.dataset.searchShortcut;
        renderSearchResults();
        searchInput.focus();
      }));
      dialog.querySelector('.search-close').addEventListener('click', () => dialog.close());
      dialog.querySelector('.search-form').addEventListener('submit', event => {
        event.preventDefault();
        searchResults.querySelector('a')?.click();
      });
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('close', () => searchButton.focus());
      searchButton.addEventListener('click', () => { dialog.showModal(); searchInput.focus(); });
    }
    document.querySelector('.newsletter-form')?.addEventListener('submit', event => {
      event.preventDefault();
      showToast('عضویت خبرنامه هنوز به سرویس ارسال ایمیل متصل نشده است.');
    });
  

    const CART_KEY = 'zarrinnegar-cart';
    const digitsToAscii = value => String(value).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    const formatMoney = value => new Intl.NumberFormat('fa-IR').format(Number(value) || 0);
    function readCart() {
      try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
    }
    function writeCart(cart) {
      try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
      renderCart();
    }
    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    }
    function renderCart() {
      const cart = readCart();
      const count = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      const badge = document.querySelector('.cart-count');
      if (badge) badge.textContent = formatMoney(count);
      const list = document.querySelector('[data-cart-list]');
      if (!list) return;
      const empty = document.querySelector('[data-cart-empty]');
      const filled = document.querySelector('[data-cart-filled]');
      const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
      if (empty) empty.hidden = cart.length > 0;
      if (filled) filled.hidden = cart.length === 0;
      if (!cart.length) { list.innerHTML = ''; }
      else {
        list.innerHTML = cart.map(item => `<article class="cart-row" data-cart-id="${escapeHTML(item.id)}"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}"><div><h3>${escapeHTML(item.name)}</h3><p>طلای ۱۸ عیار · همراه با فاکتور</p><div class="quantity-stepper"><button type="button" data-cart-action="decrease" aria-label="کاهش تعداد">−</button><span class="quantity-value">${formatMoney(item.qty)}</span><button type="button" data-cart-action="increase" aria-label="افزایش تعداد">＋</button></div></div><div class="cart-row-price">${formatMoney(item.price * item.qty)} تومان<button type="button" class="cart-remove" data-cart-action="remove">حذف</button></div></article>`).join('');
      }
      document.querySelectorAll('[data-cart-total]').forEach(node => node.textContent = `${formatMoney(total)} تومان`);
      document.querySelectorAll('[data-cart-subtotal]').forEach(node => node.textContent = `${formatMoney(total)} تومان`);
    }
    document.querySelectorAll('.product-buy').forEach(button => button.addEventListener('click', () => {
      const card = button.closest('.product-card, .product-detail');
      if (!card) return;
      const id = card.dataset.id || 'zarrin-item';
      const name = card.dataset.name || card.querySelector('.product-title')?.textContent?.trim() || 'زیور زرین‌نگار';
      const price = Number(card.dataset.price || digitsToAscii(card.querySelector('.product-price')?.textContent || '').replace(/[^0-9]/g, '')) || 0;
      const image = card.dataset.image || card.querySelector('img')?.src || '';
      const detailQuantity = card.classList.contains('product-detail') ? card.querySelector('.quantity-value')?.textContent : '1';
      const qty = Number(digitsToAscii(detailQuantity || '1')) || 1;
      const cart = readCart();
      const found = cart.find(item => item.id === id);
      if (found) found.qty += qty;
      else cart.push({id, name, price, image, qty});
      writeCart(cart);
      showToast('محصول به سبد خرید اضافه شد.');
    }));
    const cartList = document.querySelector('[data-cart-list]');
    if (cartList) cartList.addEventListener('click', event => {
      const actionButton = event.target.closest('[data-cart-action]');
      if (!actionButton) return;
      const row = actionButton.closest('[data-cart-id]');
      const cart = readCart();
      const item = cart.find(product => product.id === row.dataset.cartId);
      if (actionButton.dataset.cartAction === 'remove') writeCart(cart.filter(product => product.id !== row.dataset.cartId));
      else if (item) {
        item.qty += actionButton.dataset.cartAction === 'increase' ? 1 : -1;
        writeCart(cart.filter(product => product.qty > 0));
      }
    });
    document.querySelectorAll('[data-cart-checkout]').forEach(button => button.addEventListener('click', () => showToast('ثبت سفارش در نسخهٔ نمایشی فعال نیست.')));
    document.querySelectorAll('.quantity-stepper [data-quantity]').forEach(button => button.addEventListener('click', () => {
      const value = document.querySelector('.product-detail .quantity-value');
      if (!value) return;
      const current = Number(digitsToAscii(value.textContent)) || 1;
      value.textContent = formatMoney(Math.max(1, current + Number(button.dataset.quantity)));
    }));
    document.querySelectorAll('.gallery-thumb').forEach(button => button.addEventListener('click', () => {
      const mainImage = document.querySelector('.product-gallery-main img');
      if (!mainImage) return;
      mainImage.src = button.dataset.image;
      document.querySelectorAll('.gallery-thumb').forEach(thumb => thumb.classList.toggle('active', thumb === button));
    }));
    document.querySelectorAll('[data-filter-value]').forEach(button => button.addEventListener('click', () => {
      const value = button.dataset.filterValue;
      document.querySelectorAll('[data-filter-value]').forEach(option => option.classList.toggle('active', option === button));
      document.querySelectorAll('.catalog-item').forEach(item => item.hidden = value !== 'all' && item.dataset.category !== value);
      const shown = [...document.querySelectorAll('.catalog-item')].filter(item => !item.hidden).length;
      const resultCount = document.querySelector('[data-result-count]');
      if (resultCount) resultCount.textContent = formatMoney(shown);
    }));
    const catalogSort = document.querySelector('#catalog-sort');
    if (catalogSort) catalogSort.addEventListener('change', () => {
      const grid = document.querySelector('.catalog-products .products-grid');
      const items = [...grid.querySelectorAll('.catalog-item')];
      if (catalogSort.value === 'price-low') items.sort((a,b) => Number(a.dataset.price)-Number(b.dataset.price));
      if (catalogSort.value === 'price-high') items.sort((a,b) => Number(b.dataset.price)-Number(a.dataset.price));
      if (catalogSort.value === 'popular') items.sort((a,b) => Number(a.dataset.order)-Number(b.dataset.order));
      items.forEach(item => grid.append(item));
    });
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) contactForm.addEventListener('submit', event => {
      event.preventDefault();
      showToast('فرم تماس هنوز به سامانه پشتیبانی متصل نشده است.');
    });
    renderCart();
