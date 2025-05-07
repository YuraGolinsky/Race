// Функція для отримання лошадей і заповнення селекту
async function loadHorses() {
    const response = await fetch('/api/horses');
    const horses = await response.json();
    const horseSelect = document.getElementById('horse-id');
  
    horses.forEach(horse => {
      const option = document.createElement('option');
      option.value = horse.id;
      option.textContent = horse.name;
      horseSelect.appendChild(option);
    });
  }
  
  // Функція для обробки форми ставок
  document.getElementById('bet-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const horseId = document.getElementById('horse-id').value;
    const amount = document.getElementById('amount').value;
    const userId = 1; // Ви можете замінити це значення на ID користувача з сесії
  
    // Відправка ставки на сервер
    const response = await fetch('/api/place-bet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        horse_id: horseId,
        amount: amount,
        user_id: userId
      })
    });
  
    const result = await response.json();
    alert(result.message);
  
    // Завантаження ставок після успішного розміщення
    loadBets();
  });
  
  // Функція для завантаження ставок
  async function loadBets() {
    const response = await fetch('/api/bets');
    const bets = await response.json();
    const betsTable = document.getElementById('bets-table').getElementsByTagName('tbody')[0];
  
    // Очищення таблиці перед завантаженням нових даних
    betsTable.innerHTML = '';
  
    bets.forEach(bet => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bet.horse_name}</td>
        <td>${bet.amount}</td>
        <td>${new Date(bet.created_at).toLocaleString()}</td>
      `;
      betsTable.appendChild(row);
    });
  }
  
  // Завантаження лошадей та ставок при завантаженні сторінки
  window.onload = () => {
    loadHorses();
    loadBets();
  };
  