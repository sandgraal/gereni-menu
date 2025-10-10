fetch('data/menu.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('menu-container');
    data.sections.forEach(section => {
      const sectionEl = document.createElement('section');
      const title = document.createElement('h2');
      title.textContent = section.title;
      sectionEl.appendChild(title);

      section.items.forEach(item => {
        const dish = document.createElement('div');
        dish.classList.add('dish');
        dish.innerHTML = `<span><strong>${item.name}</strong></span><span>${item.price}</span>`;
        const desc = document.createElement('div');
        desc.classList.add('description');
        desc.textContent = item.description;
        sectionEl.appendChild(dish);
        sectionEl.appendChild(desc);
      });

      container.appendChild(sectionEl);
    });
  })
  .catch(err => console.error('Error al cargar el menú:', err));
