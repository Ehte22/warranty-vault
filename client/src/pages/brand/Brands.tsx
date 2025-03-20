import DataContainer, { DataContainerConfig } from '../../components/DataContainer'

const Products = () => {
    const config: DataContainerConfig = {
        pageTitle: "Brands",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true
    }
    return <>
        <DataContainer config={config} />
    </>
}

export default Products