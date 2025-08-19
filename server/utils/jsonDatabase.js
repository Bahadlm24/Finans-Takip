const fs = require('fs');
const path = require('path');

class JSONDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getFilePath(fileName) {
    return path.join(this.dataDir, `${fileName}.json`);
  }

  // Veri okuma
  read(fileName) {
    try {
      const filePath = this.getFilePath(fileName);
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`JSON okuma hatası (${fileName}):`, error);
      return [];
    }
  }

  // Veri yazma
  write(fileName, data) {
    try {
      const filePath = this.getFilePath(fileName);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`JSON yazma hatası (${fileName}):`, error);
      return false;
    }
  }

  // Yeni kayıt ekleme
  add(fileName, record) {
    const data = this.read(fileName);
    const newRecord = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...record
    };
    data.push(newRecord);
    this.write(fileName, data);
    return newRecord;
  }

  // Kayıt güncelleme
  update(fileName, id, updates) {
    const data = this.read(fileName);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.write(fileName, data);
      return data[index];
    }
    return null;
  }

  // Kayıt silme
  delete(fileName, id) {
    const data = this.read(fileName);
    const filteredData = data.filter(item => item.id !== id);
    if (filteredData.length !== data.length) {
      this.write(fileName, filteredData);
      return true;
    }
    return false;
  }

  // ID ile kayıt bulma
  findById(fileName, id) {
    const data = this.read(fileName);
    return data.find(item => item.id === id) || null;
  }

  // Filtreye göre kayıtları bulma
  findByFilter(fileName, filterFn) {
    const data = this.read(fileName);
    return data.filter(filterFn);
  }

  // Kullanıcıya göre kayıtları bulma
  findByUser(fileName, userId) {
    return this.findByFilter(fileName, item => item.userId === userId);
  }

  // ID oluşturma
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Veri sıralama
  sort(fileName, sortFn) {
    const data = this.read(fileName);
    return data.sort(sortFn);
  }

  // Sayfalama
  paginate(fileName, page = 1, limit = 50, filterFn = null) {
    let data = this.read(fileName);
    if (filterFn) {
      data = data.filter(filterFn);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: data.length,
        pages: Math.ceil(data.length / limit)
      }
    };
  }
}

module.exports = new JSONDatabase();
