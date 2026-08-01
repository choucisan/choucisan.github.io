(() => {
  const shell = document.querySelector('[data-poplar-gallery]');
  if (!shell) return;

  const assetBase = new URL(shell.dataset.assets || './static/', window.location.href);
  const promptElement = shell.querySelector('[data-prompt]');
  const promptCopyButton = shell.querySelector('[data-copy-prompt]');
  const mainImage = shell.querySelector('[data-main-image]');
  const viewer = shell.querySelector('[data-viewer]');
  const thumbnailViewport = shell.querySelector('[data-thumbnail-viewport]');
  const thumbnailTrack = shell.querySelector('[data-thumbnail-track]');
  const citeDialog = document.querySelector('[data-cite-dialog]');
  const citationElement = document.querySelector('[data-citation]');
  const copyLabel = document.querySelector('[data-copy-label]');

  let samples = [];
  let currentIndex = 0;
  let renderToken = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let hasDragged = false;
  let dragPointerId = null;
  let promptCopyTimer = null;

  const imageUrl = (sample) => {
    const webpName = sample.image.replace(/\.[^.]+$/, '.webp');
    return new URL(`images/${webpName}`, assetBase).href;
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
  };

  const fitViewerToImage = (image) => {
    if (!image.naturalWidth || !image.naturalHeight) return;

    const galleryWidth = shell.querySelector('.gallery')?.clientWidth || window.innerWidth;
    const isMobile = window.innerWidth <= 680;
    const maxWidth = Math.min(galleryWidth, 1024);
    const maxHeight = Math.min(window.innerHeight * (isMobile ? 0.46 : 0.54), 576);
    const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);

    viewer.style.width = `${Math.round(image.naturalWidth * scale)}px`;
    viewer.style.height = `${Math.round(image.naturalHeight * scale)}px`;
  };

  const centerActiveThumbnail = (behavior = 'smooth') => {
    const active = thumbnailTrack.querySelector('.thumbnail.is-active');
    if (!active) return;
    const left = active.offsetLeft - (thumbnailViewport.clientWidth - active.offsetWidth) / 2;
    thumbnailViewport.scrollTo({ left: Math.max(0, left), behavior });
  };

  const render = (index, behavior = 'smooth') => {
    if (!samples.length) return;

    currentIndex = (index + samples.length) % samples.length;
    const sample = samples[currentIndex];
    const token = ++renderToken;
    const nextImage = new Image();

    mainImage.classList.add('is-loading');
    nextImage.onload = () => {
      if (token !== renderToken) return;
      fitViewerToImage(nextImage);
      mainImage.src = nextImage.src;
      mainImage.alt = `Poplar sample ${sample.id}`;
      mainImage.classList.remove('is-loading');
    };
    nextImage.onerror = () => {
      if (token === renderToken) mainImage.classList.remove('is-loading');
    };
    nextImage.src = imageUrl(sample);

    promptElement.textContent = sample.prompt;
    promptElement.title = sample.prompt;

    thumbnailTrack.querySelectorAll('.thumbnail').forEach((thumbnail, thumbnailIndex) => {
      const isActive = thumbnailIndex === currentIndex;
      thumbnail.classList.toggle('is-active', isActive);
      thumbnail.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    requestAnimationFrame(() => centerActiveThumbnail(behavior));
  };

  const buildThumbnails = () => {
    const fragment = document.createDocumentFragment();
    samples.forEach((sample, index) => {
      const button = document.createElement('button');
      const image = document.createElement('img');

      button.type = 'button';
      button.className = 'thumbnail';
      button.setAttribute('aria-label', `Show ${sample.id}`);
      button.dataset.index = String(index);

      image.src = imageUrl(sample);
      image.alt = '';
      image.loading = index < 6 ? 'eager' : 'lazy';
      image.draggable = false;

      button.appendChild(image);
      button.addEventListener('click', () => {
        if (!hasDragged) render(index);
      });
      fragment.appendChild(button);
    });
    thumbnailTrack.appendChild(fragment);
  };

  const loadSamples = async () => {
    try {
      const response = await fetch(new URL('data/samples.json', assetBase));
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const payload = await response.json();
      samples = Array.isArray(payload.samples) ? payload.samples : [];
      if (!samples.length) throw new Error('No gallery samples were found.');

      currentIndex = Math.max(0, samples.findIndex((sample) => sample.id === 'Poplar-9K_000077'));
      buildThumbnails();
      render(currentIndex, 'auto');
    } catch (error) {
      promptElement.textContent = 'The Poplar gallery could not be loaded.';
      console.error('[Poplar gallery]', error);
    }
  };

  window.addEventListener('resize', () => fitViewerToImage(mainImage));

  document.addEventListener('keydown', (event) => {
    if (citeDialog?.open) return;
    if (event.key === 'ArrowLeft') render(currentIndex - 1);
    if (event.key === 'ArrowRight') render(currentIndex + 1);
  });

  let touchStartX = 0;
  viewer.addEventListener('touchstart', (event) => {
    if (event.target.closest('[data-thumbnail-viewport]')) return;
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  viewer.addEventListener('touchend', (event) => {
    if (event.target.closest('[data-thumbnail-viewport]')) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 48) return;
    render(currentIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  thumbnailViewport.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    thumbnailViewport.scrollLeft += event.deltaY;
  }, { passive: false });

  thumbnailViewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScroll = thumbnailViewport.scrollLeft;
    hasDragged = false;
  });
  thumbnailViewport.addEventListener('pointermove', (event) => {
    if (event.pointerId !== dragPointerId) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 5 && !hasDragged) {
      hasDragged = true;
      thumbnailViewport.classList.add('is-dragging');
      thumbnailViewport.setPointerCapture(event.pointerId);
    }
    if (!hasDragged) return;
    thumbnailViewport.scrollLeft = dragStartScroll - distance;
  });
  const stopDragging = (event) => {
    if (event.pointerId !== dragPointerId) return;
    if (thumbnailViewport.hasPointerCapture(event.pointerId)) {
      thumbnailViewport.releasePointerCapture(event.pointerId);
    }
    thumbnailViewport.classList.remove('is-dragging');
    dragPointerId = null;
    window.setTimeout(() => { hasDragged = false; }, 0);
  };
  thumbnailViewport.addEventListener('pointerup', stopDragging);
  thumbnailViewport.addEventListener('pointercancel', stopDragging);

  promptCopyButton?.addEventListener('click', async () => {
    await copyText(promptElement.textContent?.trim() || '');
    promptCopyButton.classList.add('is-copied');
    promptCopyButton.setAttribute('aria-label', 'Prompt copied');
    promptCopyButton.title = 'Copied';
    window.clearTimeout(promptCopyTimer);
    promptCopyTimer = window.setTimeout(() => {
      promptCopyButton.classList.remove('is-copied');
      promptCopyButton.setAttribute('aria-label', 'Copy prompt');
      promptCopyButton.title = 'Copy prompt';
    }, 1600);
  });

  document.querySelector('[data-open-cite]')?.addEventListener('click', () => citeDialog?.showModal());
  document.querySelector('[data-close-cite]')?.addEventListener('click', () => citeDialog?.close());
  citeDialog?.addEventListener('click', (event) => {
    if (event.target === citeDialog) citeDialog.close();
  });

  document.querySelector('[data-copy-citation]')?.addEventListener('click', async () => {
    const citation = citationElement?.textContent?.trim() || '';
    await copyText(citation);
    copyLabel.textContent = 'Copied';
    window.setTimeout(() => { copyLabel.textContent = 'Copy BibTeX'; }, 1600);
  });

  loadSamples();
})();
