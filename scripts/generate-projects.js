const parent = document.querySelector("#projects");

let projects = [
    {"data-year": 2025, "data-month": "June", 
     "data-tags": "Python, Rust, Finance, Machine Learning",
     "thumbnail-src": "https://via.placeholder.com/150",
     "title": "Evolutionary Algorithm for Self-Supervised Trading Agent",
     "date-string": "08/04/2025 (ongoing)"},

    {"data-year": 2025, "data-month": "June", 
     "data-tags": "Python, Deep Learning, Data Science, Physics",
     "thumbnail-src": "https://via.placeholder.com/150",
     "title": "Superconductor Dataset Analysis using GNN and MLP",
     "date-string": "08/04/2025 (ongoing)"},

    {"data-year": 2025, "data-month": "June", 
     "data-tags": "Rust, Machine Learning, Mathematics",
     "thumbnail-src": "https://via.placeholder.com/150",
     "title": "Rust-based Machine Learning Library from Scratch",
     "date-string": "08/04/2025 (ongoing)"},
     
    {"data-year": 2025, "data-month": "June", 
        "data-tags": "Python, Data Science, Web Scraping, SQL",
        "thumbnail-src": "https://via.placeholder.com/150",
        "title": "Webscraping and Parsing World-wide Futures Data",
        "date-string": "08/04/2025 (ongoing)"},
];

projects.forEach((project) => {
    const card = document.createElement("div");
    card.innerHTML = `
       <div class="project card mb-3" data-year="${project["data-year"]}" data-month="${project["data-month"]}" 
       data-tags="${project["data-tags"]}">
                    <div class="row g-0">
                        <div class="col-md-4 project-thumbnail">
                            <img src="${project["thumbnail-src"]}" class="img-fluid rounded-start">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${project["title"]}</h5>
                                <p class="card-text">${project["data-month"]} ${project["data-year"]}</p>
                                <p class="card-text"><small class="text-muted">Tags: ${project["data-tags"]}</small></p>
                                <a href="pjedinys.github.io/projects/${project["title"]}" class="btn btn-primary btn-sm">View Details</a>
                                <a href="https://github.com/pjedinys/${project["title"]}" class="btn btn-secondary btn-sm">Source Code</a>
                            </div>
                        </div>
                    </div>
                </div> 
    `
    parent.appendChild(card);
})