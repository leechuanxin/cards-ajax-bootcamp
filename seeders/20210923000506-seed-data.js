const util = require('../util.js');

module.exports = {
  up: async (queryInterface) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const users = [
      {
        username: 'chuanxin',
        real_name: 'Chuan Xin',
        password: util.getHash('testuser123'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'johnsmith',
        real_name: 'John Smith',
        password: util.getHash('testuser123'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'susanchan',
        real_name: 'Susan Chan',
        password: util.getHash('testuser123'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'cheekean',
        real_name: 'Chee Kean',
        password: util.getHash('testuser123'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'akirawong',
        real_name: 'Akira Wong',
        password: util.getHash('testuser123'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'kai',
        real_name: 'Kai',
        password: util.getHash('testuser123'),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await queryInterface.bulkInsert(
      'users',
      users,
      {},
    );
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('users', null, {});
  },
};
