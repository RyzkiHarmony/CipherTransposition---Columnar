import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const App = () => {
    const [message, setMessage] = useState('');
    const [key, setKey] = useState([1, 2, 3, 5, 4]);
    const [encryptedMessage, setEncryptedMessage] = useState('');
    const [decryptedMessage, setDecryptedMessage] = useState('');
    const [patternData, setPatternData] = useState([]);
    const [plaintextMatrix, setPlaintextMatrix] = useState([]);
    const [ciphertextMatrix, setCiphertextMatrix] = useState([]);
    const [debug, setDebug] = useState({});
    const [charStats, setCharStats] = useState({});

    // Fungsi untuk menghitung statistik karakter
    const calculateCharStats = (text) => {
        if (!text) return {};

        const stats = {};
        const total = text.length;

        // Hitung frekuensi setiap karakter
        [...text].forEach(char => {
            stats[char] = (stats[char] || 0) + 1;
        });

        // Konversi ke persentase dan urutkan
        const percentages = {};
        Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([char, count]) => {
                percentages[char] = (count / total * 100).toFixed(1);
            });

        return percentages;
    };

    // Update statistik ketika pesan berubah
    useEffect(() => {
        setCharStats(calculateCharStats(message.replace(/\s/g, '')));
    }, [message]);

    const randomizeKey = () => {
        let randomKey = [1, 2, 3, 4, 5];
        randomKey = randomKey.sort(() => Math.random() - 0.5);
        setKey(randomKey);
    };

    const getColumnOrder = (key) => {
        return key
            .map((value, index) => ({ value, index }))
            .sort((a, b) => a.value - b.value)
            .map(item => item.index);
    };

    const encrypt = () => {
        if (!message) return;

        const cleanMessage = message.replace(/\s/g, '');
        const numCols = key.length;
        const numRows = Math.ceil(cleanMessage.length / numCols);

        let plaintextGrid = Array.from({ length: numRows }, () => Array(numCols).fill(''));
        for (let i = 0; i < cleanMessage.length; i++) {
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            plaintextGrid[row][col] = cleanMessage[i];
        }

        const columnOrder = getColumnOrder(key);
        let encrypted = '';
        let cipherGrid = Array.from({ length: numRows }, () => Array(numCols).fill(''));

        for (let i = 0; i < numCols; i++) {
            const currentCol = columnOrder[i];
            for (let row = 0; row < numRows; row++) {
                const char = plaintextGrid[row][currentCol];
                if (char) {
                    encrypted += char;
                    cipherGrid[row][i] = char;
                }
            }
        }

        setDebug({
            plaintext: cleanMessage,
            columnOrder,
            plaintextGrid,
            cipherGrid,
            encrypted,
            numRows,
            numCols
        });

        setEncryptedMessage(encrypted);
        setPlaintextMatrix(plaintextGrid);
        setCiphertextMatrix(cipherGrid);
        setPatternData(plaintextGrid);
    };

    const decrypt = () => {
        if (!encryptedMessage) return;

        const numCols = key.length;
        const numRows = Math.ceil(encryptedMessage.length / numCols);
        const columnOrder = getColumnOrder(key);

        let decryptGrid = Array.from({ length: numRows }, () => Array(numCols).fill(''));

        const fullRows = Math.floor(encryptedMessage.length / numCols);
        const remainingChars = encryptedMessage.length % numCols;

        let pos = 0;
        for (let i = 0; i < numCols; i++) {
            const colLength = fullRows + (columnOrder[i] < remainingChars ? 1 : 0);
            const targetCol = columnOrder[i];

            for (let row = 0; row < colLength; row++) {
                if (pos < encryptedMessage.length) {
                    decryptGrid[row][targetCol] = encryptedMessage[pos++];
                }
            }
        }

        let decrypted = '';
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                if (decryptGrid[row][col]) {
                    decrypted += decryptGrid[row][col];
                }
            }
        }

        setDebug(prev => ({
            ...prev,
            decryptionGrid: decryptGrid,
            decrypted
        }));

        setDecryptedMessage(decrypted);
    };

    // Data untuk plot transposisi
    const plotData = {
        labels: Array.from({ length: key.length }, (_, i) => `Kolom ${key[i]}`),
        datasets: patternData.map((row, index) => ({
            label: `Baris ${index + 1}`,
            data: row.map((char) => (char ? 1 : 0)),
            backgroundColor: row.map((char) => (char ? 'rgba(75, 192, 192, 0.6)' : 'rgba(192, 75, 75, 0.3)')),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        })),
    };

    // Data untuk plot statistik karakter
    const charStatsData = {
        labels: Object.keys(charStats),
        datasets: [{
            data: Object.values(charStats),
            backgroundColor: Object.keys(charStats).map((_, index) =>
                `hsl(${(index * 360) / Object.keys(charStats).length}, 70%, 60%)`
            ),
            borderWidth: 1,
        }],
    };

    const charStatsOptions = {
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, index) => ({
                            text: `${label} (${data.datasets[0].data[index]}%)`,
                            fillStyle: data.datasets[0].backgroundColor[index],
                            index
                        }));
                    }
                }
            },
            title: {
                display: true,
                text: 'Distribusi Karakter (%)'
            }
        }
    };

    const displayMatrixWithColumnNumbers = (matrix, isCipher) => (
        <div>
            <div style={{ display: 'flex', fontWeight: 'bold', marginBottom: '5px' }}>
                {Array.from({ length: key.length }, (_, i) => (
                    <div key={i} style={{ width: '30px', textAlign: 'center' }}>
                        {isCipher ? key[i] : i + 1}
                    </div>
                ))}
            </div>
            {matrix.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex' }}>
                    {row.map((char, colIndex) => (
                        <div
                            key={colIndex}
                            style={{
                                width: '30px',
                                height: '30px',
                                border: '1px solid black',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: char ? '#e6f3ff' : '#ffffff'
                            }}
                        >
                            {char || '-'}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1>Enkripsi Transposisi Columnar</h1>
            <div style={{ marginBottom: '20px' }}>
                <textarea
                    rows="4"
                    style={{ width: '100%', maxWidth: '400px', padding: '8px' }}
                    placeholder="Masukkan pesan"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>
            <div style={{ margin: '10px 0' }}>
                <button
                    onClick={encrypt}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    Enkripsi
                </button>
                <button
                    onClick={decrypt}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    Dekripsi
                </button>
                <button
                    onClick={randomizeKey}
                    style={{ padding: '8px 16px' }}
                >
                    Randomize Key
                </button>
            </div>
            <p>Kunci saat ini: {key.join(', ')}</p>

            {/* Tambahan visualisasi statistik karakter */}
            <div style={{
                marginTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <h3>Statistik Karakter Input</h3>
                <div style={{ width: '100%', maxWidth: '600px', height: '300px' }}>
                    {Object.keys(charStats).length > 0 && (
                        <Pie data={charStatsData} options={charStatsOptions} />
                    )}
                </div>
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <p>Total karakter: {message.replace(/\s/g, '').length}</p>
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Debug Info</h3>
                <pre style={{
                    backgroundColor: '#f5f5f5',
                    padding: '10px',
                    borderRadius: '4px',
                    overflow: 'auto'
                }}>
                    {JSON.stringify(debug, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Pesan Terenkripsi:</h3>
                <div style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                    wordBreak: 'break-all'
                }}>
                    {encryptedMessage || '-'}
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Pesan Terdekripsi:</h3>
                <div style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                    wordBreak: 'break-all'
                }}>
                    {decryptedMessage || '-'}
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Matriks Plaintext</h3>
                {displayMatrixWithColumnNumbers(plaintextMatrix, false)}
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Matriks Ciphertext</h3>
                {displayMatrixWithColumnNumbers(ciphertextMatrix, true)}
            </div>

            <div style={{ width: '100%', maxWidth: '600px', height: '300px', marginTop: '20px' }}>
                <h3>Pola Transposisi Kolom</h3>
                <Bar data={plotData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
        </div>
    );
};

export default App;