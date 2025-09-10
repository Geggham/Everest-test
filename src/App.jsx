import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import DeviceList from './components/DeviceList';
import PlayerList from './components/PlayerList';
import * as api from './api'; // ожидаем: src/api/index.js

export default function App() {
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [places, setPlaces] = useState([]); // данные places из API
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadDevices() {
      setLoadingDevices(true);
      setError(null);
      try {
        const data = await api.getDevices();
        if (!mounted) return;
        setDevices(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.response?.data?.err || e?.message || 'Ошибка загрузки девайсов');
      } finally {
        if (mounted) setLoadingDevices(false);
      }
    }
    loadDevices();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedDevice) {
      setPlaces([]);
      return;
    }
    let mounted = true;
    async function loadDevice() {
      setError(null);
      try {
        const dev = await api.getDevice(selectedDevice.id);
        if (!mounted) return;
        setPlaces(dev?.places || []);
      } catch (e) {
        setError(e?.response?.data?.err || e?.message || 'Ошибка загрузки девайса');
      }
    }
    loadDevice();
    return () => { mounted = false; };
  }, [selectedDevice]);

  const handlePlaceUpdate = (placeId, newBalances) => {
    setPlaces(prev => prev.map(p => (p.place === placeId ? { ...p, balances: newBalances } : p)));
  };

  // Обёртка для вызова обновления баланса через API и обновления состояния
  const updatePlace = async (placeId, delta) => {
    setError(null);
    try {
      const res = await api.updatePlaceBalance(selectedDevice.id, placeId, delta);
      // ожидаем в ответе { balances, currency, device_id, place }
      handlePlaceUpdate(res.place, res.balances);
      return { ok: true, data: res };
    } catch (e) {
      const msg = e?.response?.data?.err || e?.message || 'Ошибка операции';
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={4}>
          <h5 className="mb-3">Devices</h5>
          {loadingDevices ? (
            <Spinner animation="border" />
          ) : (
            <DeviceList
              devices={devices}
              selectedId={selectedDevice?.id}
              onSelect={d => {
                setSelectedDevice(d);
                setError(null);
              }}
            />
          )}
        </Col>

        <Col md={8}>
          <h5 className="mb-3">Places / Players</h5>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {!selectedDevice && <div className="text-muted">Выберите девайс слева</div>}

          {selectedDevice && (
            <PlayerList
              device={selectedDevice}
              players={places}
              onUpdate={(placeId, newBalances) => handlePlaceUpdate(placeId, newBalances)}
              setError={setError}
              // передаём функцию обновления для вызова из компонента, если нужно
              updatePlace={updatePlace}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}
