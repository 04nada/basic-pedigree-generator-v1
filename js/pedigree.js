//--- ----- Generating a Family

function generateFamily() {
	var Grandfather = new Person(1, "male");
	var Grandmother = new Person(1, "female");
	
	Grandfather.AutosomalGenes = Person.generateRandomGenes();
	Grandmother.AutosomalGenes = Person.generateRandomGenes();
	
	Person.marry(Grandfather, Grandmother);
	Person.haveChildren(Grandfather, Grandmother);
	
	for (let child of Grandfather.Children) {
		continueFamily(child);
	}
	
	return Grandfather;
}

// recursive magic
function continueFamily(person) {
	if (person.Generation <= MaxGeneration) {
		var personIsMarried = person.tryToMarry();
		
		if (personIsMarried) {
			Person.haveChildren(person, person.Partner);
			
			for (let child of person.Children) {
				continueFamily(child);
			}
		}
	}
}