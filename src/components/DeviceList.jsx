import React, { useEffect, useState } from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import { getDevices } from "../api";

const DeviceList = ({ onSelect }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const data = await getDevices();
        setDevices(data);
        debugger;
      } catch (err) {
        console.error("Ошибка загрузки устройств:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <ListGroup>
      {devices.map((device) => (
        <ListGroup.Item
          key={device.id}
          action
          onClick={() => {
            onSelect(device.id);
            debugger;
          }}
        >
          {device.name}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default DeviceList;
