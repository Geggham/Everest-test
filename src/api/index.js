import axios from "axios";

// Создание экземпляра axios
const api = axios.create({
  baseURL: "https://dev-space.su/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Получить список устройств
export async function getDevices() {
  try {
    const res = await api.get("/a/devices/");
    return res.data;
  } catch (err) {
    console.error("Ошибка при получении списка девайсов:", err);
    return [];
  }
}

// Получить конкретное устройство по ID
export async function getDevice(deviceId) {
  if (!deviceId) {
    console.error("Device ID не передан!");
    return null;
  }

  try {
    const res = await api.get(`/a/devices/${deviceId}/`);
    console.log("Данные устройства:", res.data);
    return res.data;
  } catch (err) {
    console.error(`Ошибка при получении девайса ${deviceId}:`, err);
    return null;
  }
}

// Обновить баланс конкретного места устройства
export async function updatePlaceBalance(deviceId, placeId, delta) {
  if (!deviceId) {
    console.error("Device ID не передан!");
    throw new Error("Device ID не передан");
  }
  if (!placeId) {
    console.error("Place ID не передан!");
    throw new Error("Place ID не передан");
  }

  try {
    const res = await api.post(
      `/a/devices/${deviceId}/place/${placeId}/update`,
      { delta }
    );
    console.log(`Баланс места ${placeId} обновлён:`, res.data);
    return res.data;
  } catch (err) {
    console.error(`Ошибка при обновлении баланса place ${placeId}:`, err);
    throw err;
  }
}
