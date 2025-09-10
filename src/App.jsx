import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import DeviceList from "./components/DeviceList";
import PlayerList from "./components/PlayerList";
import * as api from "./api";

export default function App() {
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState(null);

  // Загрузка списка устройств

  useEffect(() => {
    let mounted = true;
    async function loadDevices() {
      setLoadingDevices(true);
      setError(null);
      try {
        const data = await api.getDevices();
        if (mounted) setDevices(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(
          e?.response?.data?.err || e?.message || "Ошибка загрузки устройств"
        );
      } finally {
        if (mounted) setLoadingDevices(false);
      }
    }
    loadDevices();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDevice) {
      setPlaces([]);
      return;
    }

    let mounted = true;

    async function loadDeviceDetails() {
      setError(null);
      try {
        const dev = await api.getDevice(selectedDevice.id);
        if (mounted) setPlaces(dev?.places || []);
      } catch (e) {
        setError(
          e?.response?.data?.err || e?.message || "Ошибка загрузки устройства"
        );
      }
    }

    loadDeviceDetails();
    return () => {
      mounted = false;
    };
  }, [selectedDevice]);

  // API-обёртка: обновить баланс и состояние
  const updatePlace = async (placeId, delta) => {
    setError(null);
    try {
      const res = await api.updatePlaceBalance(
        selectedDevice.id,
        placeId,
        delta
      );
      setPlaces((prev) =>
        prev.map((p) =>
          p.place === res.place ? { ...p, balances: res.balances } : p
        )
      );
      return { ok: true, data: res };
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Ошибка операции";
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Список устройств */}
        <Col md={24} className="mb-4">
          {loadingDevices ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <DeviceList
              devices={devices}
              selectedId={selectedDevice?.id}
              onSelect={(device) => {
                setSelectedDevice(device);
                setError(null);
              }}
            />
          )}
        </Col>

        {/* Список игроков (places) */}
        <Col md={8}>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {!selectedDevice && <div className="text-muted"></div>}

          {selectedDevice && <PlayerList />}
        </Col>
      </Row>
    </Container>
  );
}
