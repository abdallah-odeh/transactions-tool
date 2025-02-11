export function getRandomItem<T>(items: T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}


//   enum Status {
//     Pending = "PENDING",
//     InProgress = "IN_PROGRESS",
//     Completed = "COMPLETED",
//   }
  
//   function getRandomEnumValue<T>(enumObj: T): T[keyof T] {
//     const values = Object.values<T>(enumObj, {}) as T[keyof T][];
//     return getRandomItem(values);
//   }
  
//   // Example Usage
//   const randomStatus = getRandomEnumValue(Status);
//   console.log(randomStatus); // Output: A random enum value
  