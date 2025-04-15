const Airtable = require('airtable');

class AirtableWrapper {
  constructor() {
    this.base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID);
  }

  async testConnection() {
    try {
      // Try to list tables to verify connection
      const tables = await this.base.tables;
      return {
        success: true,
        message: 'Successfully connected to Airtable',
        tables: tables.map(table => table.name)
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Airtable',
        error: error.message
      };
    }
  }

  async getTable(tableName) {
    return this.base(tableName);
  }

  async listRecords(tableName, options = {}) {
    const table = await this.getTable(tableName);
    return table.select(options).firstPage();
  }

  async getRecord(tableName, recordId) {
    const table = await this.getTable(tableName);
    return table.find(recordId);
  }

  async createRecord(tableName, fields) {
    const table = await this.getTable(tableName);
    return table.create(fields);
  }

  async updateRecord(tableName, recordId, fields) {
    const table = await this.getTable(tableName);
    return table.update(recordId, fields);
  }

  async deleteRecord(tableName, recordId) {
    const table = await this.getTable(tableName);
    return table.destroy(recordId);
  }
}

module.exports = AirtableWrapper; 