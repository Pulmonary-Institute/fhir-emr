import{ useState } from 'react'
import Select from 'react-select'
export const Drowdowns = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const options = [
        { value: 'manzana', label: 'faciliti1'},
        { value: 'naranja', label: 'facility2' },
        { value: 'platano', label: 'facility3' },
    ]
    const handleChange = (option: any) => {
        setSelectedOption(option);
        console.log('Selected:', option);
    };

    return (<>
        <div style={{ width: '20%' }}>
            <Select
                options={options}
                value={selectedOption}
                onChange={handleChange}
                placeholder="Select facility"

            />
        </div>
    </>);
} 