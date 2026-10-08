import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function setup() {
  // 1. Подключаемся к серверу MySQL (без указания конкретной БД)
  // ЕСЛИ У ВАС ЕСТЬ ПАРОЛЬ, добавьте его в строку: 'mysql://root:пароль@127.0.0.1:3306'
  const connectionString = 'mysql://root@127.0.0.1:3306'; 
  
  console.log('Подключение к MySQL...');
  const connection = await mysql.createConnection(connectionString);

  // 2. Создаем базу данных
  console.log('Создание базы данных kursach_db...');
  await connection.query('CREATE DATABASE IF NOT EXISTS kursach_db;');
  
  // Переключаемся на созданную базу
  await connection.query('USE kursach_db;');
  console.log('База данных успешно создана/выбрана.');
  await connection.end();
}

setup().catch(console.error);
