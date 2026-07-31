document.addEventListener("DOMContentLoaded", () => {

  const lightbox = document.getElementById("lightbox");

  if (!lightbox) {
    return;
  }


  const lightboxImage =
    document.getElementById("lightboxImage");

  const lightboxNumber =
    document.getElementById("lightboxNumber");

  const closeButton =
    document.getElementById("lightboxClose");

  const previousButton =
    document.getElementById("lightboxPrev");

  const nextButton =
    document.getElementById("lightboxNext");


  const photos =
    Array.from(document.querySelectorAll(".photo-card"));


  let currentPhoto = 0;


  function showPhoto(index) {

    if (photos.length === 0) {
      return;
    }


    if (index < 0) {
      index = photos.length - 1;
    }


    if (index >= photos.length) {
      index = 0;
    }


    currentPhoto = index;


    const photo =
      photos[currentPhoto];


    const image =
      photo.dataset.photo;


    const number =
      photo.dataset.number;


    lightboxImage.src = image;

    lightboxImage.alt =
      `Photo ${number}`;

    lightboxNumber.textContent =
      number;

  }


  function openLightbox(index) {

    showPhoto(index);

    lightbox.classList.add("open");

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "lightbox-open"
    );

  }


  function closeLightbox() {

    lightbox.classList.remove("open");

    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "lightbox-open"
    );

  }


  photos.forEach((photo, index) => {

    photo.addEventListener("click", () => {
      openLightbox(index);
    });

  });


  closeButton.addEventListener(
    "click",
    closeLightbox
  );


  previousButton.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      showPhoto(currentPhoto - 1);

    }
  );


  nextButton.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      showPhoto(currentPhoto + 1);

    }
  );


  lightbox.addEventListener(
    "click",
    (event) => {

      if (
        event.target === lightbox
      ) {
        closeLightbox();
      }

    }
  );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        !lightbox.classList.contains("open")
      ) {
        return;
      }


      if (event.key === "Escape") {
        closeLightbox();
      }


      if (event.key === "ArrowLeft") {
        showPhoto(currentPhoto - 1);
      }


      if (event.key === "ArrowRight") {
        showPhoto(currentPhoto + 1);
      }

    }
  );


  /* Mobile swipe */

  let touchStartX = 0;


  lightbox.addEventListener(
    "touchstart",
    (event) => {

      touchStartX =
        event.changedTouches[0].screenX;

    },
    { passive: true }
  );


  lightbox.addEventListener(
    "touchend",
    (event) => {

      const touchEndX =
        event.changedTouches[0].screenX;

      const difference =
        touchStartX - touchEndX;


      if (Math.abs(difference) < 50) {
        return;
      }


      if (difference > 0) {
        showPhoto(currentPhoto + 1);
      } else {
        showPhoto(currentPhoto - 1);
      }

    },
    { passive: true }
  );

});
