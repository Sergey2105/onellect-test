import path from "path";
import * as fs from "fs";
import { Config, DataToSend } from "./types/index.interface";

export function generateRandomArray() {
  const length = Math.floor(Math.random() * 81) + 20;
  const arr = [];

  for (let i = 0; i < length; i++) {
    const num = Math.floor(Math.random() * 201) - 100;
    arr.push(num);
  }

  return arr;
}

function selectionSort(arr: number[]) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    let temp = arr[i];
    arr[i] = arr[minIndex];
    arr[minIndex] = temp;
  }
  return arr;
}

function insertionSort(arr: number[]) {
  let n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

function randomFunctionSorted(
  numbers: number[],
  sortType: ((arr: number[]) => number[])[]
) {
  const randomIndex = Math.floor(Math.random() * sortType.length);
  const selectedSort = sortType[randomIndex];

  return {
    sortedArray: selectedSort([...numbers]),
    sortMethod: selectedSort.name,
  };
}

async function loadConfig(): Promise<Config> {
  try {
    const filePath = path.resolve(__dirname, "../config.json");
    const raw = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("Файл конфигурации не найден");
  }
}
async function apiPost(data: DataToSend, apiUrl: string) {
  try {
    console.log(`Отправка на: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Данные отправлены");
      return await response.json();
    } else {
      console.error(
        `Ошибка отправки ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Ошибка при отправке данных:", error.message);
    } else {
      console.error("Неизвестная ошибка:", error);
    }
  }
}

async function main() {
  try {
    const config = await loadConfig();

    const numbers = generateRandomArray();
    console.log("Сгенерированный список чисел:");
    console.log(numbers.join(", "));

    const result = randomFunctionSorted(numbers, [
      selectionSort,
      insertionSort,
    ]);

    console.log("Отсортированный массив:");
    console.log(result.sortedArray.join(", "));

    const dataToSend = {
      original: numbers,
      sorted: result.sortedArray,
      sortMethod: result.sortMethod,
    };

    console.log(`Метод сортировки: ${result.sortMethod}`);

    await apiPost(dataToSend, config.postURL);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Ошибка выполнения:", error.message);
    } else {
      console.error("Ошибка выполнения:", error);
    }
  }
}

main();
