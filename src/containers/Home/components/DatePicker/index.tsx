import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
function CalendarPicker() {
    const [selectedDate, setSelectedDate] = useState(null)
    return (<>
        <DatePicker
            selected={selectedDate}
            onChange={(date:any) => setSelectedDate(date)}
            dateFormat="MM/dd/yyyy" // Formato de la fecha
            placeholderText="Select Date"
        />
    </>)
}
export default CalendarPicker