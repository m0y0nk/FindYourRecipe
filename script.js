const recipeApi = 'c60380fa3a0f4dcda9dc4bfc81a0e134';

const ingredients = [];
const selectedItems = document.querySelectorAll('.item');
const createRecipeBtn = document.querySelector('.submit-button')

selectedItems.forEach(item => {
    item.dataset.value = item.textContent.trim();
});

selectedItems.forEach(item => {
    item.addEventListener('click', () => {
        let val = item.dataset.value;
        
        if (!ingredients.includes(val)) {
            ingredients.push(val);
            item.style.backgroundColor = '#2c3e50';
            item.style.color = 'white';
        }

        console.log(ingredients);
    });
});

createRecipeBtn.addEventListener('click',()=>{
    if(ingredients.length===0) {
        alert('Please make atleast one selection for creating a recipe')
        return
    }
    let ingredientsQuery = ingredients.join(",");
    let url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsQuery}&number=6&apiKey=${recipeApi}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayData(data)
        })
        .catch(error => console.error("Error fetching data:", error));
})

let isHidden = true;

function toggleDisplay(element) {
    element.style.display = isHidden ? 'block' : 'none';
    isHidden = !isHidden;
}

function displayData(results) {
    const displayRegion = document.querySelector('#resultsTab');
    
    displayRegion.style.cssText = `
        position: fixed;
        color: #333;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        padding: 2rem;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 80vh;
        width: 85%;
        max-width: 1200px;
        overflow-y: auto;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 1000;
    `;

    if (!displayRegion.querySelector('.resHeader')) {
        const resHeader = document.createElement('div');
        resHeader.classList.add('resHeader');
        resHeader.innerHTML = `
            <h2>Recipes for Your Ingredients</h2>
            <button class="close-button" onclick="toggleDisplay(document.querySelector('#resultsTab'))">×</button>
        `;
        resHeader.style.cssText = `
            font-family: "Dancing Script", serif;
            font-size: 2.5rem;
            color: #2c3e50;
            text-align: center;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid rgba(44, 62, 80, 0.1);
            position: relative;
        `;

        const closeButtonStyle = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 2rem;
            background: none;
            border: none;
            color: #2c3e50;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            &:hover {
                background: rgba(44, 62, 80, 0.1);
            }
        `;

        displayRegion.appendChild(resHeader);
        const closeButton = displayRegion.querySelector('.close-button');
        closeButton.style.cssText = closeButtonStyle;

        closeButton.addEventListener('click', ()=>{displayRegion.style.display = 'none'; location.reload()})

        const resMain = document.createElement('div');
        resMain.classList.add('recipe-results');
        resMain.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            padding: 1rem;
            overflow-y: auto;
        `;

        const recipeCardStyle = `
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease;
            cursor: pointer;
            height: 300px;
            &:hover {
                transform: translateY(-5px);
            }
        `;

        results.forEach(recipe => {
            const card = document.createElement('div');
            card.classList.add('recipe-card');
            card.style.cssText = recipeCardStyle;
            card.style.backgroundImage = `url('${recipe.image}')`;
            card.style.position = 'relative';
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';

            card.innerHTML = `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                            background: rgba(0,0,0,0.3); border-radius: 15px;"></div>
                <div style="position: relative; z-index: 2;">
                    <h3 style="font-size: 1.5rem; color: white; margin-bottom: 1rem; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
                        ${recipe.title}
                    </h3>
                    <div style="color: white; font-size: 0.9rem; line-height: 1.6; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
                        <p>Likes: ${recipe.likes}</p>
                        <div style="margin-top: 1rem;">
                            <strong>Matched Ingredients:</strong> ${recipe.usedIngredientCount}
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', async () => {
                try {
                    const recipeId = recipe.id;
                    const detailsUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${recipeApi}`;
                    const response = await fetch(detailsUrl);
                    const recipeDetails = await response.json();
                    showRecipeModal(recipeDetails);
                } catch (error) {
                    console.error("Error fetching recipe details:", error);
                }
            });

            resMain.appendChild(card);
        });

        displayRegion.appendChild(resMain);
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        z-index: 999;
    `;
    document.body.appendChild(overlay);
    
    toggleDisplay(displayRegion);
}

async function showRecipeModal(recipe) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        height: 90%;
        background: white;
        z-index: 1100;
        border-radius: 20px;
        padding: 2rem;
        overflow-y: auto;
        box-shadow: 0 0 20px rgba(0,0,0,0.2);
    `;

    // Fetch recipe video link
    let videoLink = "No video available";
    try {
        const videoResponse = await getRecipeVideo(recipe.title);
        videoLink = videoResponse || "No video available";
    } catch (error) {
        console.error("Error fetching video:", error);
    }

    modal.innerHTML = `
        <button class="close-modal" style="position: absolute; right: 20px; top: 20px;">×</button>
        <h2 style='font-family: "Dancing Script", serif;
            font-size: 2.5rem;
            color: #2c3e50;
            text-align: center;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid rgba(44, 62, 80, 0.1);
            position: relative;'>${recipe.title}</h2>
        <div style='display: grid;
            place-items: center;'>
            <img src="${recipe.image}" alt="${recipe.title}" style="width: 100%; border-radius: 15px; max-width: 500px;">
        </div>
        <div style="display: flex; flex-direction: column; padding-top: 24px; padding-bottom: 24px align-items: center">
        <div>
            <h3 style="margin: 10px">Instructions:</h3>
            <p>${recipe.instructions}</p>
            <h3 style="margin: 10px">Recipe Video:</h3>
            <p><a href="${videoLink}" target="_blank">${videoLink}</a></p>
        </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close button functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
}

async function getRecipeVideo(dishName) {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${dishName}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.meals) {
            return ("YouTube Link:", data.meals[0].strYoutube);
        } else {
            return ("No recipe found!");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}