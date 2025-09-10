import React, { useEffect, useState } from "react";
import {
  ListGroup,
  Spinner,
  Button,
  Table,
  Form,
  Alert,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import { getDevices, getDevice, updatePlaceBalance } from "../api";

const DeviceList = () => {
  // Состояния для устройств, выбранного устройства, загрузки, ошибок и т.д.

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingPlaceId, setUpdatingPlaceId] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  // Загрузка списка устройств при монтировании компонента

  useEffect(() => {
    async function fetchDevices() {
      try {
        const data = await getDevices();
        setDevices(data);
      } catch (err) {
        console.error("Ошибка загрузки устройств:", err);
        setErrorMessage("Ошибка загрузки устройств");
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  // Обработчик выбора устройства и загрузки его данных

  const handleSelect = async (deviceId) => {
    setSelectedDevice(null);
    setAmounts({});
    setErrorMessage("");
    setLoading(true);
    try {
      const data = await getDevice(deviceId);
      setSelectedDevice(data);
    } catch (err) {
      console.error("Ошибка при получении устройства:", err);
      setErrorMessage("Ошибка при получении устройства");
    } finally {
      setLoading(false);
    }
  };

  // Валидация суммы: проверка на положительное число с максимум двумя знаками после запятой

  const isValidAmount = (value) => {
    const num = parseFloat(value);
    return (
      !isNaN(num) && num >= 0 && /^(\d+|\d+\.\d{1,2})$/.test(value.toString())
    );
  };

  /*
  В реальном финансовом приложении такая валидация имеет критическое значение:
  1. Позволяет избежать ошибок при вычислениях, которые могут привести к некорректным или неправильным операциям с деньгами.
  2. Слишком точные значения после запятой могут привести к неожиданным результатам в расчетах или неправильно округленным итоговым суммам.
  3. Обеспечивает защиту от ввода ошибочных данных, таких как строки или слишком длинные дробные числа, что особенно важно при работе с денежными транзакциями.
  4. Системы, которые не ограничивают количество знаков после запятой, могут столкнуться с проблемами округления и точности вычислений, 
  что в финансовых приложениях может вызвать серьёзные ошибки и даже финансовые потери.
*/

  // Обработчик изменения баланса (внесение или снятие средств)
  const handleBalanceChange = async (placeId, type) => {
    const rawAmount = amounts[placeId];
    if (!isValidAmount(rawAmount)) {
      setErrorMessage("Введите корректную сумму (до 2 знаков после запятой)");
      return;
    }

    const delta =
      type === "deposit" ? +parseFloat(rawAmount) : -parseFloat(rawAmount);
    setUpdatingPlaceId(placeId);
    setErrorMessage("");

    try {
      await updatePlaceBalance(selectedDevice.id, placeId, delta);
      const updatedDevice = await getDevice(selectedDevice.id);
      setSelectedDevice(updatedDevice);
      setAmounts((prev) => ({ ...prev, [placeId]: "" }));
    } catch (err) {
      const message =
        err.response?.data?.detail || "Ошибка при обновлении баланса";
      setErrorMessage(message);
    } finally {
      setUpdatingPlaceId(null);
    }
  };

  // Если данные загружаются, показываем спиннер

  if (loading)
    return (
      <div className="d-flex justify-content-center my-4">
        <Spinner animation="border" role="status" />
      </div>
    );

  return (
    <Container fluid>
      <Row className="my-4">
        {/* Список устройств */}

        <Col md={24} className="mb-4 mb-md-0">
          <h4 className="mb-3">Устройства</h4>
          <ListGroup>
            {devices.map((device) => (
              <ListGroup.Item
                key={device.id}
                action
                active={selectedDevice?.id === device.id}
                onClick={() => handleSelect(device.id)}
                style={{ cursor: "pointer", marginBottom: 5, borderWidth: 1 }}
              >
                {device.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Данные выбранного устройства */}

        <Col md={24} style={{ minWidth: 0, overflowX: "auto" }}>
          {selectedDevice ? (
            <>
              <h4 className="mb-3">{selectedDevice.name}</h4>

              {/* Ошибки, если они есть */}

              {errorMessage && (
                <Alert
                  variant="danger"
                  onClose={() => setErrorMessage("")}
                  dismissible
                  className="mb-3"
                >
                  {errorMessage}
                </Alert>
              )}

              {/* Таблица с игроками и балансом */}

              <Table
                striped
                bordered
                responsive
                hover
                className="text-center align-middle"
              >
                <thead>
                  <tr>
                    <th>Place</th>
                    <th>Currency</th>
                    <th>Balance</th>
                    <th style={{ minWidth: "120px" }}>Amount</th>
                    <th colSpan={2} style={{ minWidth: "140px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDevice.places.map((place) => (
                    <tr key={place.place}>
                      <td>{place.place}</td>
                      <td>{place.currency}</td>
                      <td>{place.balances.toFixed(2)}</td>
                      <td style={{ maxWidth: "150px" }}>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Сумма"
                          value={amounts[place.place] || ""}
                          onChange={(e) =>
                            setAmounts((prev) => ({
                              ...prev,
                              [place.place]: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="success"
                          disabled={
                            updatingPlaceId === place.place ||
                            !isValidAmount(amounts[place.place])
                          }
                          onClick={() =>
                            handleBalanceChange(place.place, "deposit")
                          }
                          className="w-100"
                        >
                          {updatingPlaceId === place.place
                            ? "Обновление..."
                            : "Deposit"}
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={
                            updatingPlaceId === place.place ||
                            !isValidAmount(amounts[place.place])
                          }
                          onClick={() =>
                            handleBalanceChange(place.place, "withdraw")
                          }
                          className="w-100"
                        >
                          {updatingPlaceId === place.place
                            ? "Обновление..."
                            : "Withdraw"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <div className="text-muted mt-4">Выберите устройство</div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DeviceList;
