fetch('data/menu.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('menu-container');
    if (!container) {
      console.error('No se encontró el contenedor del menú.');
      return;
    }
    (data.sections || []).forEach(section => {
      const sectionEl = document.createElement('section');
      const title = document.createElement('h2');
      title.textContent = section.title;
      sectionEl.appendChild(title);

      section.items.forEach(item => {
        const dish = document.createElement('div');
        dish.classList.add('dish');
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('dish-name');
        nameSpan.textContent = item.name;

        const priceSpan = document.createElement('span');
        priceSpan.classList.add('dish-price');
        priceSpan.textContent = item.price;

        dish.appendChild(nameSpan);
        dish.appendChild(priceSpan);
        const desc = document.createElement('div');
        desc.classList.add('description');
        desc.textContent = item.description;
        sectionEl.appendChild(dish);
        if (item.description) {
          sectionEl.appendChild(desc);
        }
      });

      container.appendChild(sectionEl);
    });

    const updatedLabel = document.getElementById('menu-updated');
    if (updatedLabel) {
      if (data.updatedAt) {
        const parsedDate = new Date(data.updatedAt);
        if (!Number.isNaN(parsedDate.valueOf())) {
          const formatted = parsedDate.toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          updatedLabel.textContent = `Actualizado el ${formatted}`;
        } else {
          updatedLabel.remove();
        }
      } else {
        updatedLabel.remove();
      }
    }
  })
  .catch(err => console.error('Error al cargar el menú:', err));
