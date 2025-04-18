console.log("main.js loaded successfully")

const applyFiltersButton = document.getElementById('applyFilters');
const elementsToggle = document.getElementById('elementsToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

elementsToggle.addEventListener('click', function () {
    cards = document.querySelectorAll(".card");
    cards.forEach(element => {
        if (element && element.classList.contains('hidden') == false) {  // Check if element exists before attempting to modify it
            element.classList.add('hidden');
        } else if (element) {
            element.classList.remove('hidden')
        }
    });
});
        
// Dark-mode toggle
darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
if (body.classList.contains('light-mode')) {
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    body.classList.remove('dark-mode');
} else {
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    body.classList.add('dark-mode');
}
});


function filterProjects() {            
    const projectCards = document.querySelectorAll('.project');
    const yearFilter = document.getElementById('yearFilter');
    const monthFilter = document.getElementById('monthFilter');
    const tagFilterInput = document.getElementById('tagFilterInput');
    const selectedYear = yearFilter.value;
    const selectedMonth = monthFilter.value;
    const tagInputValue = tagFilterInput.value.trim().toLowerCase();
    const selectedTags = tagInputValue ? tagInputValue.split(',').map(tag => tag.trim()) : [];

    projectCards.forEach(card => {
        const cardYear = card.dataset.year;
        const cardMonth = card.dataset.month;
        const cardTags = card.dataset.tags.toLowerCase().split(',').map(tag => tag.trim());
        let yearMatch = false;
        let monthMatch = false;
        let tagMatch = true; // default true to only filter selected tag

        if (selectedYear === 'all' || selectedYear === cardYear) {
            yearMatch = true;
        }

        if (selectedMonth === 'all' || selectedMonth === cardMonth) {
            monthMatch = true;
        }

        if (selectedTags.length > 0) {
            console.log(selectedTags, cardTags)
            tagMatch = selectedTags.every(tag => cardTags.includes(tag));  // ensure every tag is present
        } else {
            tagMatch = true; // If no tags are entered, all should pass the tag filter
        }

        if (yearMatch && monthMatch && tagMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}


applyFiltersButton.addEventListener('click', filterProjects);
document.getElementById('tagFilterInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        document.getElementById('applyFilters').click(); // Trigger the button click
     }
});

