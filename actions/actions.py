# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions

from typing import Text, List, Any, Dict

from rasa_sdk import Tracker, FormValidationAction, Action
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.types import DomainDict


# Validate postage form: this is what I will use to fill out the signed

# From the Rasa docs: By default, Rasa will ask for the next empty slot from the slots listed for your form in the domain file.
# I think that if you put in an invalid cuisine (the example runs), and have the slot set to be None, the purpose is that the required_slots
# method will detect that the vuisine slot ain't filled and ask a question again -> that is kind of what we are doing, but in reverse
# where we fill in another slot 
class ValidatePostageForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_postage_form"

    # This will run every turn to validate the latest user filled slots
    # "In this case, you need to write functions named validate_<slot_name> for every extracted slot."
    # So here, validate_tracked will validate for tracked -> and we don't have to do it for every required_slot, so I think we will instead do the following
    def validate_tracked(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        
        # The question is, will this work correctly -> currently removing this, and trusting the docs
        # requested_tracked = tracker.get_slot('tracked')

        if slot_value is True:
            # if tracked is True, that means it can't be signed so we set signed to false
            return {"tracked": True, "signed": False}
        
        # Why do I have a feeling this is going to run no matter what - tho I do hope the slots default start with None
        # No, the slot can be empty: from the docs for bool slots -> "If influence_conversation is set to true, the assistant's behavior will change depending on 
        # whether the slot is empty, set to true or set to false. 
        # Note that an empty bool slot influences the conversation differently than if the slot was set to false."
        elif slot_value is False:
            # If not tracked, inform user about signed instead and set that slot to true
            dispatcher.utter_message(response="utter_signed")
            return {"tracked": False, "signed": True}

### Ngl, I could potentially have the same action server for two bots, and just write two alternate functions -> and one chatbot calls 
### ActionCalculatePostageHigh (for high anthro) and the other have ...Low (for low anthro)
### Can't have the same action server for all 4 because of the ValidatePostageForm class -> and even if I could work around it, I think I will have separate 
### servers just for correctness and debugging ease
class ActionCalculatePostage(Action):
    def name(self) -> Text:
        return "action_calculate_postage"
    
    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        insured = tracker.get_slot("insured")
        tracked = tracker.get_slot("tracked")

        post_cost = 3.20 if tracked else 2.80

        if insured:
            post_cost += 6.49
        
        cost_message = f"Perfect! So just to summarise, the postage option you have chosen based on my recommendation is: {'Tracked' if tracked else 'Signed'} {'with' if insured else 'without'} Insurance. \n\n The total cost would be £{post_cost:.2f}"

        dispatcher.utter_message(cost_message)
        return []

class ActionCalculatePostageLow(Action):
    def name(self) -> Text:
        return "action_calculate_postage_low"
    
    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        insured = tracker.get_slot("insured")
        tracked = tracker.get_slot("tracked")

        post_cost = 3.20 if tracked else 2.80

        if insured:
            post_cost += 6.49
        
        cost_message = f"Summary of the chosen postage option: {'Tracked' if tracked else 'Signed'} {'with' if insured else 'without'} Insurance. \n\n Total cost: £{post_cost:.2f}"

        dispatcher.utter_message(cost_message)
        return []

# The following is from the tutorial, tho modified slightly bcs I dunno if the API works correctly
# import requests
# import json
# from rasa_sdk import Action

# class ActionJoke(Action):
#   def name(self):
#     return "action_joke"

#   def run(self, dispatcher, tracker, domain):
#     # Dunno if this API is up to date, will instead just utter a message akin to hello world
#     # request = requests.get('http://api.icndb.com/jokes/random').json()  # make an api call
#     # joke = request['value']['joke']  # extract a joke from returned json response
#     dispatcher.utter_message(text="Hello World")  # send the message back to the user
#     return []