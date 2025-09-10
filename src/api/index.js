import axios from "axios";

const api = axios.create({
  baseURL: "https://dev-space.su/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getDevices() {
  try {
    const res = await api.get("/a/devices/");
    return res.data;
  } catch (err) {
    console.error("Ошибка при получении списка девайсов:", err);
    return [];
  }
}

export async function getDevice(deviceId) {
  try {
    const res = await api.get(`/a/devices/${deviceId}/`);
    console.log(res.data);

    return res.data;
  } catch (err) {
    console.error(`Ошибка при получении девайса ${deviceId}:`, err);
    return null;
  }
}

export async function updatePlaceBalance(deviceId, placeId, delta) {
  try {
    const res = await api.post(
      `/a/devices/${deviceId}/place/${placeId}/update`,
      {
        delta,
      }
    );
    return res.data;
  } catch (err) {
    console.error(`Ошибка при обновлении баланса place ${placeId}:`, err);
    throw err;
  }
}
