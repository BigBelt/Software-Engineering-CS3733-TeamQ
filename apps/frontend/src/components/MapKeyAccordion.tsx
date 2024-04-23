import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MapKeyAccordion() {
  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="rounded-[10px] bg-white drop-shadow-lg absolute bottom-7 right-72"
      >
        <AccordionItem value="Map">
          <AccordionTrigger className="font-bold mx-16">
            Map Key
          </AccordionTrigger>
          <AccordionContent className="grid grid-cols-2 grid-flow-dense">
            <img
              src="./mapkeyicons/restroom.png"
              alt="restroom"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="pe-5">Restrooms</p>
            <img
              src="./mapkeyicons/elevator.png"
              alt="elevator"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">Elevator</p>
            <img
              src="./mapkeyicons/ATM.png"
              alt="ATM"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">ATM</p>
            <img
              src="./mapkeyicons/cafe.png"
              alt="cafe"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">Cafe</p>
            <img
              src="./mapkeyicons/emergency.png"
              alt="emergency"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">Emergency</p>
            <img
              src="./mapkeyicons/giftshop.png"
              alt="giftshop"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">Gift Shop</p>
            <img
              src="./mapkeyicons/information.png"
              alt="information"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">Information</p>
            <img
              src="./mapkeyicons/parking.png"
              alt="parking"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">Parking</p>
            <img
              src="./mapkeyicons/pharmacy.png"
              alt="pharmacy"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">Pharmacy</p>
            <img
              src="./mapkeyicons/valet.png"
              alt="valet"
              className="object-scale-down h-7 w-7 ps-2"
            />
            <p className="">Valet</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
