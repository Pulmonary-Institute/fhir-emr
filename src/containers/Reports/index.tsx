import { Trans } from '@lingui/macro';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { PageContainer } from '@beda.software/emr/components';
import { Drowdowns } from '../../components/SearchComponent/searchComponents';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    TablePagination,
    Typography,
} from '@mui/material';
import { fetchAllData } from './hook';
import { useState, useEffect } from 'react';
function Report() {
    const [allData, setAllData] = useState([]);
    useEffect(() => {
        loadEncounters();
    }, []);

    const data = [{ id: 'Patient1', name: '123' }];
    const styleHeader = {
        fontWeight: 'bold',
        fontSize: '1rem',
        backgroundColor: '#f5f5f5',
        color: '#333',
    };

    const [page, setPage] = useState(0); // Página actual
    const [rowsPerPage, setRowsPerPage] = useState(5); // Filas por página

    const loadEncounters = async () => {
        const data: any = await fetchAllData();
        setAllData(data);
    };
    // Controla el cambio de página
    const handleChangePage = (_event: React.ChangeEvent<unknown> | null, newPage: number) => {
        setPage(newPage);
    };

    // Controla el cambio de filas por página
    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    return (
        <>
            <PageContainer
                title={<Trans>Reports</Trans>}
                header={{
                    children: <Drowdowns />,
                }}
            >
                <TableContainer component={Paper}>
                    <Typography variant="h6" style={{ marginBottom: 16, marginLeft: 10, marginTop: 5 }}>
                        Total: {allData.length}
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={styleHeader}>
                                    <Trans>Name</Trans>
                                </TableCell>
                                <TableCell sx={styleHeader}>
                                    <Trans>MRN</Trans>
                                </TableCell>
                                <TableCell sx={styleHeader}>
                                    <Trans>DOB</Trans>
                                </TableCell>
                                <TableCell sx={styleHeader}>
                                    <Trans>Age</Trans>
                                </TableCell>
                                <TableCell sx={styleHeader}>
                                    <Trans>DX</Trans>
                                </TableCell>
                                <TableCell sx={styleHeader}>
                                    <Trans>Code</Trans>
                                </TableCell>
                                <TableCell sx={styleHeader}>
                                    <Trans>Type of Care</Trans>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allData.map((row: any) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.patientName}</TableCell>
                                    <TableCell>{row.mrn}</TableCell>
                                    <TableCell>{row.dob}</TableCell>
                                    <TableCell>{row.age}</TableCell>
                                    <TableCell>{row.dx.map((dx: any) => `${dx} `)}</TableCell>
                                    <TableCell>{row.code}</TableCell>
                                    <TableCell>{row.typeOfCare}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]} // Opciones de filas por página
                        component="div"
                        count={data.length} // Total de filas en la tabla
                        rowsPerPage={rowsPerPage} // Número de filas por página
                        page={page} // Página actual
                        onPageChange={handleChangePage} // Función para cambiar la página
                        onRowsPerPageChange={handleChangeRowsPerPage} // Función para cambiar las filas por página
                    />
                </TableContainer>
            </PageContainer>
        </>
    );
}
export default Report;
