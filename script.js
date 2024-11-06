let currentPage = 1;
const itemsPerPage = 20;
let filteredPokemon = [];

// Função para carregar a lista de Pokémon
async function loadPokemonList(page) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${(page - 1) * itemsPerPage}&limit=${itemsPerPage}`);
    const data = await response.json();
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = '';

    for (let p of data.results) {
        const pokemonResponse = await fetch(p.url);
        const pokemonData = await pokemonResponse.json();

        const sprite = pokemonData.sprites.front_default;
        const col = document.createElement('div');
        col.className = 'col-md-3';
        col.innerHTML = `
    <div class="card mb-4 shadow-sm">
      <img src="${sprite}" class="card-img-top" alt="${p.name}">
      <div class="card-body">
        <h5 class="card-title">${p.name}</h5>
        <button class="btn btn-primary" onclick="showPokemonDetails('${p.url}')">Detalhes</button>
      </div>
    </div>`;
        pokemonList.appendChild(col);
    }
}

// Função para determinar a raridade e o preço do Pokémon
async function getPokemonRarityAndPrice(pokemonData) {
    let basePrice = 100;
    let rarity = 'Comum';

    // Verificar se é um Pokémon lendário ou mítico
    const speciesResponse = await fetch(pokemonData.species.url);
    const speciesData = await speciesResponse.json();
    if (speciesData.is_legendary || speciesData.is_mythical) {
        rarity = 'Lendário/Mítico';
        basePrice = 2000;
    }

    // Lista de Pokémon iniciais e suas evoluções
    const starters = [
        'bulbasaur', 'ivysaur', 'venusaur',
        'charmander', 'charmeleon', 'charizard',
        'squirtle', 'wartortle', 'blastoise',
        'chikorita', 'bayleef', 'meganium',
        'cyndaquil', 'quilava', 'typhlosion',
        'totodile', 'croconaw', 'feraligatr',
        'treecko', 'grovyle', 'sceptile',
        'torchic', 'combusken', 'blaziken',
        'mudkip', 'marshtomp', 'swampert',
        'turtwig', 'grotle', 'torterra',
        'chimchar', 'monferno', 'infernape',
        'piplup', 'prinplup', 'empoleon',
        'snivy', 'servine', 'serperior',
        'tepig', 'pignite', 'emboar',
        'oshawott', 'dewott', 'samurott',
        'chespin', 'quilladin', 'chesnaught',
        'fennekin', 'braixen', 'delphox',
        'froakie', 'frogadier', 'greninja',
        'rowlet', 'dartrix', 'decidueye',
        'litten', 'torracat', 'incineroar',
        'popplio', 'brionne', 'primarina',
        'grookey', 'thwackey', 'rillaboom',
        'scorbunny', 'raboot', 'cinderace',
        'sobble', 'drizzile', 'inteleon'
    ];
    
    // Verificar se é um Pokémon inicial ou sua evolução
    if (starters.includes(pokemonData.name)) {
        rarity = 'Inicial';
        basePrice = 300;
    }

    // Lista de Pokémon raros (você pode expandir esta lista conforme necessário)
    const rarePokemon = ['dratini', 'dragonair', 'dragonite', 'larvitar', 'pupitar', 'tyranitar', 'bagon', 'shelgon', 'salamence', 'beldum', 'metang', 'metagross', 'gible', 'gabite', 'garchomp', 'axew', 'fraxure', 'haxorus', 'goomy', 'sliggoo', 'goodra', 'jangmo-o', 'hakamo-o', 'kommo-o'];
    
    // Verificar se é um Pokémon raro
    if (rarePokemon.includes(pokemonData.name)) {
        rarity = 'Raro';
        basePrice = 500;
    }

    // Verificar o estágio de evolução
    const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
    const evolutionChainData = await evolutionChainResponse.json();
    const evolutionStage = getEvolutionStage(evolutionChainData.chain, pokemonData.name);

    // Ajustar o preço base de acordo com o estágio de evolução
    let evolutionMultiplier = 1;
    switch (evolutionStage) {
        case 2:
            evolutionMultiplier = 1.5;
            break;
        case 3:
            evolutionMultiplier = 2;
            break;
    }

    // Calcular o preço final
    const finalPrice = Math.round(basePrice * evolutionMultiplier);

    return {
        rarity: rarity,
        price: finalPrice
    };
}

// Função para obter o estágio de evolução
function getEvolutionStage(chain, pokemonName) {
    let stage = 1;

    if (chain.species.name === pokemonName) return stage;

    if (chain.evolves_to.length > 0) {
        stage = 2;
        if (chain.evolves_to[0].species.name === pokemonName) return stage;

        if (chain.evolves_to[0].evolves_to.length > 0) {
            stage = 3;
            if (chain.evolves_to[0].evolves_to[0].species.name === pokemonName) return stage;
        }
    }

    return stage;
}

// Função para mostrar os detalhes do Pokémon
async function showPokemonDetails(url) {
    const response = await fetch(url);
    const data = await response.json();

    // Sprite e Nome
    document.getElementById('pokemon-name').textContent = data.name;
    document.getElementById('pokemon-sprite').src = data.sprites.front_default;

    // Tipos com cores
    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
        grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
        ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', fairy: '#EE99AC'
    };
    const types = data.types.map(t => {
        const typeName = t.type.name;
        return `<span class="badge" style="background-color:${typeColors[typeName]};">${typeName}</span>`;
    });
    document.getElementById('pokemon-types').innerHTML = types.join(' ');

    // Habilidades
    const abilities = data.abilities.map(a => a.ability.name).join(', ');
    document.getElementById('pokemon-abilities').textContent = abilities;

    // Hidden ability
    const hiddenAbility = data.abilities.find(a => a.is_hidden);
    document.getElementById('pokemon-hidden-ability').textContent = hiddenAbility ? hiddenAbility.ability.name : 'None';

    // Natures (dropdown)
    const natureResponse = await fetch('https://pokeapi.co/api/v2/nature/');
    const natureData = await natureResponse.json();
    const natures = natureData.results.map(n => `<option value="${n.name}">${n.name}</option>`).join('');
    document.getElementById('pokemon-natures').innerHTML = `<option selected>Choose Nature</option>` + natures;

    // Obter raridade e preço
    const rarityAndPrice = await getPokemonRarityAndPrice(data);

    // Atualizar o preço e a raridade no modal
    document.getElementById('pokemon-price').textContent = rarityAndPrice.price;
    document.getElementById('pokemon-rarity').textContent = rarityAndPrice.rarity;

    // Stats Base
    const stats = data.stats.map(stat => {
        let statClass = '';
        switch (stat.stat.name) {
            case 'hp': statClass = 'stat-hp'; break;
            case 'attack': statClass = 'stat-attack'; break;
            case 'defense': statClass = 'stat-defense'; break;
            case 'special-attack': statClass = 'stat-special-attack'; break;
            case 'special-defense': statClass = 'stat-special-defense'; break;
            case 'speed': statClass = 'stat-speed'; break;
        }
        return `
    <li>
      ${stat.stat.name}: ${stat.base_stat}
      <div class="stat-bar ${statClass}" style="width: ${stat.base_stat / 2}%"></div>
    </li>`;
    }).join('');
    document.getElementById('pokemon-stats').innerHTML = stats;

    // Mostrar o modal
    const pokemonModal = new bootstrap.Modal(document.getElementById('pokemonModal'));
    pokemonModal.show();

    const modalFooter = document.querySelector('#pokemonModal .modal-footer');
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        <button type="button" class="btn btn-primary" onclick="addToCart('${data.name}', ${rarityAndPrice.price})">Adicionar ao Carrinho</button>
    `;
}

async function loadPokemonTypes() {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();
    const filterType = document.getElementById('filter-type');
    filterType.innerHTML = '<option value="">Todos os Tipos</option>';
    data.results.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        filterType.appendChild(option);
    });
}

async function filterPokemon(exactMatch = false) {
    const query = document.getElementById('search-pokemon').value.toLowerCase();
    const type = document.getElementById('filter-type').value;

    let url = `https://pokeapi.co/api/v2/pokemon?limit=1000`;
    const response = await fetch(url);
    const data = await response.json();

    filteredPokemon = data.results;

    if (query) {
        if (exactMatch) {
            filteredPokemon = filteredPokemon.filter(pokemon => pokemon.name === query);
        } else {
            filteredPokemon = filteredPokemon.filter(pokemon => pokemon.name.includes(query));
        }
    }

    if (type) {
        const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const typeData = await typeResponse.json();
        const pokemonOfType = typeData.pokemon.map(p => p.pokemon.name);
        filteredPokemon = filteredPokemon.filter(pokemon => pokemonOfType.includes(pokemon.name));
    }

    currentPage = 1;
    displayPokemon();
}

async function displayPokemon() {
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagePokemons = filteredPokemon.slice(start, end);

    for (let p of pagePokemons) {
        const pokemonResponse = await fetch(p.url);
        const pokemonData = await pokemonResponse.json();

        const sprite = pokemonData.sprites.front_default;
        const col = document.createElement('div');
        col.className = 'col-md-3';
        col.innerHTML = `
    <div class="card mb-4 shadow-sm">
      <img src="${sprite}" class="card-img-top" alt="${p.name}">
      <div class="card-body">
        <h5 class="card-title">${p.name}</h5>
        <button class="btn btn-primary" onclick="showPokemonDetails('${p.url}')">Detalhes</button>
      </div>
    </div>`;
        pokemonList.appendChild(col);
    }

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
    document.getElementById('page-input').value = currentPage;
    document.getElementById('prev-page').classList.toggle('disabled', currentPage === 1);
    document.getElementById('next-page').classList.toggle('disabled', currentPage === totalPages);
}

document.getElementById('search-pokemon').addEventListener('input', () => filterPokemon(false));
document.getElementById('search-pokemon').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        filterPokemon(true);
    }
});
document.getElementById('filter-type').addEventListener('change', () => filterPokemon(false));

document.getElementById('prev-page').addEventListener('click', function(e) {
    e.preventDefault();
    if (currentPage > 1) {
        currentPage--;
        displayPokemon();
    }
});

document.getElementById('next-page').addEventListener('click', function(e) {
    e.preventDefault();
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPokemon();
    }
});

document.getElementById('page-input').addEventListener('change', function() {
    const selectedPage = parseInt(this.value);
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
    if (selectedPage > 0 && selectedPage <= totalPages) {
        currentPage = selectedPage;
        displayPokemon();
    }
});

// Carregar a lista inicial de Pokémon
filterPokemon();

// Adicione este código no final do script

// Função para lidar com o login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    // Aqui você implementaria a lógica de autenticação
    console.log('Login:', email, password);
    // Fechar o modal após o login
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
});

// Função para lidar com o registro
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('As senhas não coincidem');
        return;
    }
    
    // Aqui você implementaria a lógica de registro
    console.log('Registro:', name, email, password);
    // Fechar o modal após o registro
    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
});

// Adicione esta função no final do seu script
function resetToHomePage() {
    document.getElementById('search-pokemon').value = '';
    document.getElementById('filter-type').value = '';
    currentPage = 1;
    filterPokemon(false);
}

// Adicione este event listener
document.getElementById('home-link').addEventListener('click', function(e) {
    e.preventDefault();
    resetToHomePage();
});

let cart = [];

function addToCart(pokemon, price) {
    const existingItem = cart.find(item => item.pokemon === pokemon);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ pokemon, price, quantity: 1 });
    }
    updateCartCount();
    updateCartModal();
}

function removeFromCart(pokemon) {
    cart = cart.filter(item => item.pokemon !== pokemon);
    updateCartCount();
    updateCartModal();
}

function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        row.innerHTML = `
            <td>${item.pokemon}</td>
            <td>${item.price} moedas</td>
            <td>${item.quantity}</td>
            <td>${itemTotal} moedas</td>
            <td><button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.pokemon}')">Remover</button></td>
        `;
        cartItems.appendChild(row);
    });

    document.getElementById('cart-total').textContent = total;
}

document.getElementById('apply-discount').addEventListener('click', function() {
    const discountCode = document.getElementById('discount-code').value;
    // Aqui você pode implementar a lógica de aplicação de desconto
    console.log('Aplicando desconto:', discountCode);
});

document.getElementById('checkout-btn').addEventListener('click', function() {
    // Aqui você pode implementar a lógica de finalização da compra
    console.log('Finalizando compra:', cart);
});