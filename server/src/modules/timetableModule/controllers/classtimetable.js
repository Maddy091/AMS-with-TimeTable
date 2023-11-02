const ClassTable = require("../../../models/classtimetable");
const HttpException = require("../../../models/http-exception");

const ClassTimeTabledto = require("../dto/classtimetable");
const ClassTimeTableDto = new ClassTimeTabledto();

const TimeTabledto = require("../dto/timetable");
const TimeTableDto = new TimeTabledto();

class ClassTimeTableController {
  async savett(req, res) {
    const timetableData = req.body.timetableData; // Access the timetableData object
    try {
      for (const day of Object.keys(timetableData)) {
        const dayData = timetableData[day];
        for (const slot of Object.keys(dayData)) {
          let slotData = dayData[slot]; // Access the slotData array
          slotData = slotData.flat(); 
          const { code, sem } = req.body;
  
          const query = {
            day,
            slot,
            code,
            sem,
          };
  
          const existingRecord = await ClassTable.findOne(query);
  
          if (existingRecord) {
            // If a record already exists, update it with the new slotData
            existingRecord.slotData = slotData;
            await existingRecord.save();
            console.log(`Updated class table data for ${day} - ${slot}`);
          } else {
            // If no record exists, create a new one with the slotData
            const timetableObject= await ClassTimeTableDto.findTimeTableIdByCode(code);
            const classTableInstance = new ClassTable({
              day,
              slot,
              slotData,
              code,
              sem,
              timetable:timetableObject,
            });
            await classTableInstance.save();
            console.log(`Saved class table data for ${day} - ${slot}`);
          }
        }
      }
  
      res.status(200).json({ message: "Data updated or created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
 
  async saveslot(req, res) {
    const day = req.params.day;
    const slot = req.params.slot;
    const slotData = req.body.slotData; // Access the slotData object
    const code = req.body.code;
    const sem = req.params.sem;
    console.log('sem',sem)
    try {
      const query = {
        day,
        slot,
        code,
        sem,
      };

      const  session = await TimeTableDto.getSessionByCode(code);
         
      let isSlotAvailable = true; // Assume the slot is initially available
      const unavailableItems = [];

      for (const slotItem of slotData) {
        if (slotItem.room){
          const roomSlots = await ClassTimeTableDto.findRoomDataWithSession(session, slotItem.room);
          const isRoomAvailable = await ClassTimeTableDto.isRoomSlotAvailable(day, slot, roomSlots,sem);
          if (!isRoomAvailable) {
              isSlotAvailable = false; // At least one item is not available
              if (!isRoomAvailable) {
                  unavailableItems.push({ item: slotItem, reason: "room" });
              }
          }
      }
      if (slotItem.faculty){
      const facultySlots = await ClassTimeTableDto.findFacultyDataWithSession(session, slotItem.faculty);
      const isFacultyAvailable = await ClassTimeTableDto.isFacultySlotAvailable(day, slot, facultySlots, sem);
      if (!isFacultyAvailable) {
        isSlotAvailable = false; // At least one item is not available

        if (!isFacultyAvailable) {
            unavailableItems.push({ item: slotItem, reason: "faculty" });
        }

    }  
    }


    }
      if (isSlotAvailable) {
        // const existingRecord = await ClassTable.findOne(query);
    //   if (existingRecord) {
    //     existingRecord.slotData = slotData;
    //     await existingRecord.save();
    //     console.log(`Updated class table data for ${day} - ${slot}`);
    //   } else{
    //     const timetableObject = await ClassTimeTableDto.findTimeTableIdByCode(code);
    //     console.log(slotData)
    //     console.log(slotData.subject)
    //     if (!(slotData.subject=='' && slotData.faculty=='' && slotData.room==''))
    //     {
    //     const classTableInstance = new ClassTable({
    //       day,
    //       slot,
    //       slotData,
    //       code,
    //       sem,
    //       timetable: timetableObject,
    //     });
    //     await classTableInstance.save();
    //     console.log(`Saved class table data for ${day} - ${slot}`);
      
      res.status(200).json({ message: "Slot is available" });
    }else {
        res.status(200).json({
            message: "Slot is not available. Check faculty and room availability for more details",
            unavailableItems,
        });
    }
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
}
}

  async classtt(req, res) {
    try {
      const sem = req.params.sem;
      const code = req.params.code;
  
      // Query the database to find records that match the sem and code
      const records = await ClassTable.find({ sem, code });
  
      // Create an empty timetable data object
      const timetableData = {};
  
      // Iterate through the records and format the data
      records.forEach((record) => {
        // Extract relevant data from the record
        const { day, slot, slotData } = record;
  
        // Create or initialize the day in the timetableData
        if (!timetableData[day]) {
          timetableData[day] = {};
        }
  
        // Create or initialize the slot in the day
        if (!timetableData[day][slot]) {
          timetableData[day][slot] = [];
        }
  
        // Access the "slotData" array and push its values
     // Access the "slotData" array and push its values
     const formattedSlotData = slotData.map(({ subject, faculty, room }) => ({
      subject,
      faculty,
      room,
    }));

    timetableData[day][slot].push(formattedSlotData);
        // Set the sem and code for the timetable
        timetableData.sem = sem;
        timetableData.code = code;
      });
  
      res.status(200).json(timetableData);
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching and formatting data from the database');
    }
  }
  

  async facultytt(req, res) {
    const facultyname = req.params.facultyname; 
    const code=req.params.code;
    console.log('facultyname:', facultyname);
    try {
      // Query the ClassTable collection based on the 'faculty' field
      // const facultydata = await ClassTable.find({ faculty: facultyname });
      const session = await TimeTableDto.getSessionByCode(code);
      const records = await ClassTimeTableDto.findFacultyDataWithSession(session,facultyname);
      // Create an empty timetable data object
      const timetableData = {};
  
      // Iterate through the records and format the data
      records.forEach((record) => {
        // Extract relevant data from the record
        const { day, slot, slotData,sem } = record;
  
        // Create or initialize the day in the timetableData
        if (!timetableData[day]) {
          timetableData[day] = {};
        }
  
        // Create or initialize the slot in the day
        if (!timetableData[day][slot]) {
          timetableData[day][slot] = [];
        }
   // Iterate through the slotData array and filter based on faculty name
   const matchingSlotData = slotData.filter((slotItem) => slotItem.faculty === facultyname);

   // Access the matching values from the filtered slotData and push them
   const formattedSlotData = matchingSlotData.map(({ subject, room }) => ({
       subject,
       sem,
       room,
   }));

    timetableData[day][slot].push(formattedSlotData);
        // Set the sem and code for the timetable
      });
      // console.log(timetableData)
      res.status(200).json(timetableData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  
  async roomtt(req, res) {
    const roomno = req.params.room; 
    const code=req.params.code;
    // console.log('room no:', roomno);
    try {
      const session = await TimeTableDto.getSessionByCode(code);
      const records = await ClassTimeTableDto.findRoomDataWithSession(session,roomno);
      const timetableData = {};
      records.forEach((record) => {
      const { day, slot, slotData,sem } = record;
        if (!timetableData[day]) {
          timetableData[day] = {};
        }
        if (!timetableData[day][slot]) {
          timetableData[day][slot] = [];
        }
   
   // Iterate through the slotData array and filter based on faculty name
   const matchingSlotData = slotData.filter((slotItem) => slotItem.room === roomno);
 
  const formattedSlotData = matchingSlotData.map(({ subject, faculty }) => ({
      subject,
      faculty,    
      sem,
    }));

    timetableData[day][slot].push(formattedSlotData);
        // Set the sem and code for the timetable
      });
      // console.log('rooom data',timetableData)
      res.status(200).json(timetableData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }


}
module.exports = ClassTimeTableController;


