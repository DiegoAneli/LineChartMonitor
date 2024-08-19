import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ConnectionCounts {
  port22: number[];
  port23: number[];
  port25: number[];
  port53: number[];
  port80: number[];
  port443: number[];
  port445: number[];
  port3389: number[];
}

const getPortColor = (port: string): string => {
  switch (port) {
    case '22':
      return 'rgba(0, 255, 0, 1)'; 
    case '23':
      return 'rgba(255, 0, 0, 1)'; 
    case '25':
      return 'rgba(0, 255, 255, 1)'; 
    case '53':
      return 'rgba(255, 255, 0, 1)'; 
    case '80':
      return 'rgba(255, 0, 255, 1)'; 
    case '443':
      return 'rgba(0, 0, 255, 1)'; 
    case '445':
      return 'rgba(128, 0, 128, 1)'; 
    case '3389':
      return 'rgba(255, 165, 0, 1)'; 
    default:
      return 'rgba(136, 136, 136, 1)'; 
  }
};

const NetworkLineChart: React.FC = () => {
  const [connectionCounts, setConnectionCounts] = useState<ConnectionCounts>({
    port22: [],
    port23: [],
    port25: [],
    port53: [],
    port80: [],
    port443: [],
    port445: [],
    port3389: [],
  });

  const [selectedPort, setSelectedPort] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/connections');
        const data = response.data;

        const counts = {
          port22: data.filter((conn: any) => conn.local_port === 22 || conn.remote_port === 22).length,
          port23: data.filter((conn: any) => conn.local_port === 23 || conn.remote_port === 23).length,
          port25: data.filter((conn: any) => conn.local_port === 25 || conn.remote_port === 25).length,
          port53: data.filter((conn: any) => conn.local_port === 53 || conn.remote_port === 53).length,
          port80: data.filter((conn: any) => conn.local_port === 80 || conn.remote_port === 80).length,
          port443: data.filter((conn: any) => conn.local_port === 443 || conn.remote_port === 443).length,
          port445: data.filter((conn: any) => conn.local_port === 445 || conn.remote_port === 445).length,
          port3389: data.filter((conn: any) => conn.local_port === 3389 || conn.remote_port === 3389).length,
        };

        setConnectionCounts((prev: ConnectionCounts) => ({
          port22: [...prev.port22.slice(-59), counts.port22],
          port23: [...prev.port23.slice(-59), counts.port23],
          port25: [...prev.port25.slice(-59), counts.port25],
          port53: [...prev.port53.slice(-59), counts.port53],
          port80: [...prev.port80.slice(-59), counts.port80],
          port443: [...prev.port443.slice(-59), counts.port443],
          port445: [...prev.port445.slice(-59), counts.port445],
          port3389: [...prev.port3389.slice(-59), counts.port3389],
        }));
      } catch (error) {
        console.error('Errore nel recupero delle connessioni:', error);
      }
    };

    fetchConnections();
    const intervalId = setInterval(fetchConnections, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handlePortClick = (port: string) => {
    setSelectedPort(selectedPort === port ? null : port);
  };

  const handleShowAllClick = () => {
    setSelectedPort(null);
  };

  const filteredConnectionCounts = selectedPort
    ? { [`port${selectedPort}`]: connectionCounts[`port${selectedPort}` as keyof ConnectionCounts] }
    : connectionCounts;

  const chartData = {
    labels: Array(connectionCounts.port22.length).fill(''),
    datasets: Object.entries(filteredConnectionCounts).map(([port, data]) => ({
      label: `Port ${port.slice(4)} (${port.slice(4) === '22' ? 'SSH' : port.slice(4) === '23' ? 'Telnet' : port.slice(4) === '25' ? 'SMTP' : port.slice(4) === '53' ? 'DNS' : port.slice(4) === '80' ? 'HTTP' : port.slice(4) === '443' ? 'HTTPS' : port.slice(4) === '445' ? 'SMB' : 'RDP'})`,
      data: data,
      fill: true,
      backgroundColor: getPortColor(port.slice(4)).replace('1)', '0.2)'),
      borderColor: getPortColor(port.slice(4)),
      borderWidth: 1,
    }))
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
      <div style={{ width: '200px', padding: '20px', color: '#fff', borderRight: '1px solid #444', marginRight: '20px' }}>
        <h3>Legend</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Object.entries(connectionCounts).map(([port, data]) => (
            <li
              key={port}
              onClick={() => handlePortClick(port.slice(4))}
              style={{
                cursor: 'pointer',
                color: selectedPort === port.slice(4) ? getPortColor(port.slice(4)) : '#ffffff',
                marginBottom: '10px',
              }}
            >
              <span style={{ backgroundColor: getPortColor(port.slice(4)), padding: '5px', marginRight: '10px' }}></span>
              Port {port.slice(4)} ({data[data.length - 1] || 0})
            </li>
          ))}
        </ul>
        <button onClick={handleShowAllClick} style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer', color: '#fff', backgroundColor: '#444' }}>
          Show all ports
        </button>
      </div>
      <div style={{ width: '800px', padding: '20px', backgroundColor: '#000', borderRadius: '8px' }}>
        <Line data={chartData} options={{
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#fff' 
              }
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#fff' 
              },
              grid: {
                color: '#444' 
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#fff' 
              },
              grid: {
                color: '#444' 
              }
            }
          }
        }} />
      </div>
    </div>
  );
};

export default NetworkLineChart;
