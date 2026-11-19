/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const users = await knex('users').select('id', 'email');
  const userMap = {};
  users.forEach((u) => {
    userMap[u.email] = u.id;
  });

  const categoryData = [
    {
      userEmail: 'admin@example.com',
      categories: [
        { name: 'Elektronik & Gadget', description: 'Perangkat elektronik, laptop, smartphone, dan aksesoris kantor' },
        { name: 'Peralatan Kantor', description: 'Kebutuhan inventaris, alat tulis kantor, dan perabot kerja' },
        { name: 'Software & Lisensi', description: 'Lisensi aplikasi, langganan cloud, dan sistem operasi' }
      ]
    },
    {
      userEmail: 'user@example.com',
      categories: [
        { name: 'Pakaian & Fashion', description: 'Koleksi pakaian kasual, formal, dan pakaian luar' },
        { name: 'Sepatu & Tas', description: 'Sepatu sneakers, formal, ransel, dan dompet' },
        { name: 'Aksesoris & Jam Tangan', description: 'Kacamata, topi, jam tangan, dan perhiasan' }
      ]
    },
    {
      userEmail: 'nao@example.com',
      categories: [
        { name: 'Buku & Referensi', description: 'Buku fiksi, sains, teknologi, dan komik' },
        { name: 'Hobi & Koleksi', description: 'Model kit, board game, dan pernak-pernik koleksi' },
        { name: 'Fotografi & Video', description: 'Kamera, lensa, gimbal, dan pencahayaan studio' }
      ]
    },
    {
      userEmail: 'shin@example.com',
      categories: [
        { name: 'Olahraga & Kebugaran', description: 'Peralatan gym, sepatu lari, dan pakaian olahraga' },
        { name: 'Kesehatan & Nutrisi', description: 'Suplemen vitamin, protein bar, dan obat-obatan pribadi' },
        { name: 'Otomotif & Perawatan', description: 'Aksesoris motor/mobil, pelumas, dan perkakas darurat' }
      ]
    }
  ];

  for (const item of categoryData) {
    const userId = userMap[item.userEmail];
    if (!userId) continue;

    for (const cat of item.categories) {
      const existing = await knex('categories')
        .where({ user_id: userId, name: cat.name })
        .first();

      if (!existing) {
        await knex('categories').insert({
          user_id: userId,
          name: cat.name,
          description: cat.description
        });
      }
    }
  }
};
