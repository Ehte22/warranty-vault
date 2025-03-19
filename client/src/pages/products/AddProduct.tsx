import { Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'

const AddProduct = () => {
    const config: DataContainerConfig = {
        pageTitle: "Add Product",
        backLink: "../",
    }
    return <>
        <DataContainer config={config} />
        <Paper sx={{ mt: 2, p: 2 }}>
            Form
        </Paper>

    </>
}

export default AddProduct