var apiURL = 'http://inventicator.dev/source.json';

var vueModel = {

	el: '#inventicatorApp',

	data: {

		source: {},
		questions: {},
		questionsLoaded: false,
		currentAnswers: {},
		currentScores: {},
		marketType: '',
		devMode: false

	},

	computed: {

		currentAnswers: function currentAnswers()
		{

			var currentAnswers = {};

			for (var handle in this.questions) {

				currentAnswers[handle] = this.$get('questions.' + handle + '.currentAnswer');

			}

			return currentAnswers;

		},

		currentScores: function currentScores()
		{

			var currentScores = {};

			for (var handle in this.questions) {

				var question = this.$get('questions.' + handle);
				var currentAnswer = this.$get('questions.' + handle + '.currentAnswer');
				var currentScore = 0;

				if (question.type == 'select')
				{

					currentScore = this.$get('questions.' + handle + '.options.' + currentAnswer + '.score') || 0;

				}
				else if (question.type == 'multiselect')
				{

					for (var i=0; i < currentAnswer.length; i++)
					{

						if (currentAnswer[i])
						{
							var optionScore = this.$get('questions.' + handle + '.options.' + currentAnswer[i] + '.score') || 0;
							currentScore += optionScore;
						}

					}

				}
				else if (question.type == 'plusminus')
				{

					for (var i=0; i < currentAnswer.length; i++)
					{

						if (currentAnswer[i])
						{
							var currentOption = currentAnswer[i].substr(1);
							var currentOperator = currentAnswer[i].substr(0,1);
							var optionValue = this.$get('questions.' + handle + '.options.' + currentOption + '.score') || 0;
							currentScore += (currentOperator == '-' ? -1*optionValue : optionValue);
						}

					}

				}
				else
				{
					// currentScore = 0
				}

				currentScores[handle] = currentScore;

			}

			return currentScores;

		},

		developmentStatusTotal: function developmentStatusTotal()
		{

			var e6 = this.getScore('prototypeStatus');
			var e17 = this.getScore('priorArtSearch');
			var e26 = this.getScore('searchResults');
			var e35 = this.getScore('patent');
			var e46 = this.getScore('trademark');

			var f24 = ( e17 > 1 ? ( 2 * ( e17 - 2 ) ) : -30 ); // Prior Art Search multiplier
			var f33 = e26; // Search Results multiplier

			// =IF(
			//  F24=-30,
			//  (+E6*(((+E46+(2*E35))/4))+F33-30),
			//  (+E6*(((+F24+E46+(2*E35))/4))+F33)
			// )

			if ( this.getScore('searchResults') == 'noSearch' )
			{
				var score = ( e6 * ( ( ( e46 + ( 2 * e35 ) ) / 4 ) ) + f33 - 30);
			}
			else
			{
				var score = ( e6 * ( ( ( f24 + e46 + ( 2 * e35 ) ) / 4 ) ) + f33);
			}

			this.log("Recalculated developmentStatusTotal: " + score);

			return score;

		},

		salesChannelTotal: function salesChannelTotal()
		{

			var e59 = this.getScore('competition');
			var e70 = this.getScore('categoryHype');
			var e81 = this.getScore('marketEntry');

			var f90 = ( e81 < 3 ? ( ( ( -1 / e81 ) * 10 ) ) : e81 ); // Market Entry multiplier

			// =(+E59+E70+F90)

			var score = e59 + e70 + f90;

			this.log("Recalculated salesChannelTotal: " + score);

			return score;

		},

		compareToAlternativesTotal: function compareToAlternativesTotal()
		{

			var e96 = this.getScore('timeSavings');
			var e108 = this.getScore('moneySavings');
			var e141 = this.getScore('otherBenefits') * 2;
			var e144 = this.getScore('influentials');

			var f105 = ( e96 > 2 ? 1 : -1 ); // Time Savings multiplier
			var f106 = ( e96 > 1 ? 1 : 10 ); // Time Savings multiplier
			var f117 = ( e108 > 2 ? 1 : -1 ); // Money Savings multiplier
			var f118 = ( e108 > 1 ? 1 : 10 ); // Money Savings multiplier
			var f151 = ( ( ( e144 * 2 ) - 5 ) * 3 ) - 9; // Influentials multiplier

			// =(E96*(F105*F106))+(E108*(F117*F118))+(E141+F151)

			var score = ( e96 * ( f105 * f106 ) ) + ( e108 * ( f117 * f118 ) ) + ( e141 + f151 );

			this.log("Recalculated compareToAlternativesTotal: " + score);

			return score;

		},

		conceptStrengthTotal: function conceptStrengthTotal()
		{

			var e156 = this.getScore('problemStrength');
			var e168 = this.getScore('difference');
			var e180 = this.getScore('standAloneProduct');
			var e191 = this.getScore('clearBenefits');

			var f165 = ( e156 > 2 ? 1 : -5 ); // Problem Strenth multiplier
			var f166 = ( e156 > 1 ? 1 : 7 ) ; // Problem Strenth multiplier
			var f177 = ( e168 > 2 ? 1 : -3 ); // Difference multiplier
			var f178 = ( e168 > 1 ? 1 : 7 ); // Difference multiplier

			// =(E156*(F165*F166))+(E168*(F177*F178))+E180+E191

			var score = ( e156 * ( f165 * f166 ) ) + ( e168 * ( f177 * f178) ) + e180 + e191;

			this.log("Recalculated conceptStrengthTotal: " + score);

			return score;

		},

		marketTotal: function marketTotal()
		{

			var e233 = this.getScore('marketSize');
			var e244 = this.getScore('userWantToBuy');
			var e255 = this.getScore('buyingDecision');
			var e262 = this.getScore('seasonalOrYear');

			var f221 = this.getScore('marketConsumer'); // Market (Consumer) total
			var f222 = ( f221 > 7 ? 7 : f221) ; // Market (Consumer) multiplier/limiter
			var f228 = this.getScore('marketNonConsumer'); // Market (Non-Consumer) total
			var f229 = ( f228 > 7 ? 7 : f228) ; // Market (Non-Consumer) multiplier/limiter
			var e230 = ( f222 > 1 ? f222 : f229 );
			var f242 = e233 * e230 / 2; // Market Size multiplier

			// =(E244*F242/3)-((7-E255)*7)-(7-E262)

			var score = ( e244 * f242 / 3 ) - ( ( 7 - e255 ) * 7 ) - ( 7 - e262 );

			// TODO: Change option values to match F221 and F228 properly

			this.log("Recalculated marketTotal: " + score);

			return score;

		},

		profitInvestmentTotal: function profitInvestmentTotal()
		{

			var e267 = this.marketTotal;

			var e271 = this.getScore('retailCost');
			var e278 = ( e271 > 3 ? e271 : ( e271 - 4 ) * 10 ); // Retail/Cost adjust
			var e279 = ( e271 == 1 ? 10 : 1 ); // Retail/Cost adjust
			var e280 = ( e271 == 2 ? 2 : 1 ); // Retail/Cost adjust
			var e281 = ( e278 * e279 * e280 ) + ( e267 / 2 ); // Retail/Cost total profit value

			var e285 = this.getScore('mvpCost');
			var d294 = ( ( e271 > 3 && e267 > 0 ) ? ( e267 + 10 ) / ( 6 - e271 ) : e281 ); // MVP Cost profit value

			// =+D294+E285

			var score = d294 + e285;

			this.log("Recalculated profitInvestmentTotal: " + score);

			return score;

		},

		feasibilityTotal: function feasibilityTotal()
		{

			var e299 = this.getScore('canItBeMade');
			var e306 = ( e299 == 1 ? 500 : 1 ); // perpetual motion adjust
			var e307 = ( e299 == 2 ? 7 : 1 ); // new tech adjust
			var e308 = ( e299 == 3 ? 3 : 1 ); // tested tech adjust

			var e310 = this.getScore('regulations');
			var e317 = ( e310 == 1 ? 3 : 1 ); // FDA approval adjust
			var e318 = ( e310 == 3 ? 2 : 1 ); // EPA reporting adjust
			var e319 = ( e310 == 3 ? 3 : 1 ); // guidelines adjust

			var e320 = ( ( e299 - 7 ) * 3 * e306 * e307 * e308 ) + ( ( e310 - 7 ) * 3 * e317 * e318 );

			var score = ( e320 > -10000 ? e320 : -1/.00001 );
			// If `canItBeMade` is answered with `claimsPerpetualMotion`, this invention "Violates Laws of Physics"

			this.log("Recalculated feasibilityTotal: " + score);

			return score;

		},

		socialEconomicConsiderationsTotal: function socialEconomicConsiderationsTotal()
		{

			var socialEconomicConsiderations = this.getScore('socialEconomicConsiderations');

			// =+(B335-C335)*5

			var score = socialEconomicConsiderations * 5;

			this.log("Recalculated socialEconomicConsiderationsTotal: " + score);

			return score;

		},

		grandTotalRaw: function grandTotalRaw()
		{

			var e336 = this.socialEconomicConsiderationsTotal;
			var e320 = this.feasibilityTotal;
			var e295 = this.profitInvestmentTotal;
			var e267 = this.marketTotal;
			var e198 = this.conceptStrengthTotal;
			var e152 = this.compareToAlternativesTotal;
			var e91 = this.salesChannelTotal;
			var e55 = this.developmentStatusTotal;

			var g337 = ( e336 + e320 + e295 + e267 + e198 + e152 + e91 + e55 );

			return g337;

		},

		grandTotal: function grandTotal()
		{

			var score = ( this.grandTotalRaw > 0 ? this.grandTotalRaw : 0 );

			return Math.round(score);

		},

		totals: function totals()
		{
			return {
				developmentStatus: this.developmentStatusTotal,
				salesChannel: this.salesChannelTotal,
				compareToAlternatives: this.compareToAlternativesTotal,
				conceptStrength: this.conceptStrengthTotal,
				market: this.marketTotal,
				profitInvestment: this.profitInvestmentTotal,
				feasibility: this.feasibilityTotal,
				socialEconomicConsiderations: this.socialEconomicConsiderationsTotal,
				grandTotalRaw: this.grandTotalRaw,
				grandTotal: this.grandTotal
			};
		}

	},

	methods: {

		fetchData: function fetchData()
		{

			this.log("Loading...");
			this.$http.get(apiURL).then(
				function(data) {
					this.log(data);
					this.source = data.data;
					this.log("Loaded.");
					Vue.nextTick(this.setUpQuestions);
					return true;
				},
				function(data)  {
					this.log("Error.");
					this.log(data);
					return false;
				}
			);

		},

		setUpQuestions: function setUpQuestions()
		{

			this.log("setUpQuestions()");

			// Load in questions from source.
			this.$set('questions', this.source.questions);

			// Assign handles from keys.
			for (var handle in this.source.questions) {

				var question = this.$get('source.questions.' + handle);
				var componentName = ('inv-question' + (question.type ? '-' + question.type : ''));

				this.$set('questions.' + handle + '.handle', handle);
				this.$set('questions.' + handle + '.componentName', componentName);

				if (question.type == 'multiselect' || question.type == 'plusminus')
				{
					this.$set('questions.' + handle + '.currentAnswer', []);
				}
				else
				{
					this.$set('questions.' + handle + '.currentAnswer', '');
				}

			}

			// Let the VM know it's okay to render questions...
			this.questionsLoaded = true;

		},

		getScore: function getScore(handle)
		{
			if (!this.questionsLoaded) return 0;
			return this.$get('currentScores.' + handle) || 0;
		},

		getAnswer: function getAnswer(handle)
		{
			if (!this.questionsLoaded) return null;
			return this.$get('currentAnswers.' + handle);
		},

		log: function log(msg)
		{
			this.devMode ? console.log(msg) : null;
		}

	},

	created: function()
	{
		this.fetchData();
	}

};

var QuestionInput = Vue.extend({
	props: ['handle'],
	template: '#tmp-inv-question',
	data: function()
	{
		return {
			'question': this.$parent.$get('questions.' + this.handle)
		}
	},
	created: function()
	{
		this.inputName = "selections[" + this.handle + "]";
	}
});

var SelectQuestionInput = QuestionInput.extend({
	template: '#tmp-inv-question-select'
});

var MuliSelectQuestionInput = QuestionInput.extend({
	template: '#tmp-inv-question-multiselect'
});

var PlusMinusQuestionInput = QuestionInput.extend({
	template: '#tmp-inv-question-plusminus'
});


Vue.component('inv-question', QuestionInput);
Vue.component('inv-question-select', SelectQuestionInput);
Vue.component('inv-question-multiselect', MuliSelectQuestionInput);
Vue.component('inv-question-plusminus', PlusMinusQuestionInput);

var I = new Vue(vueModel);

///

var Chart = {

	init: function init()
	{

		google.charts.load('current', {'packages':['gauge']});
		google.charts.setOnLoadCallback(this.drawChart);

	},

	drawChart: function drawChart()
	{

		var data = google.visualization.arrayToDataTable([
			['Label', 'Value'],
			['Inventicator', 358],
		]);

		var options = {
			width: 450, height: 220,
			min: 0, max: 358,
			redFrom: 0, redTo: 36,
			yellowFrom: 100, yellowTo: 199,
			greenFrom: 200, greenTo: 1000,
			minorTicks: 10
		};

		var chart = new google.visualization.Gauge(document.getElementById('chart_div'));

		chart.draw(data, options);

		data.setValue(0, 1, I.grandTotal);
		chart.draw(data, options);

		I.$watch('grandTotal', function(val, oldVal){
			data.setValue(0, 1, val);
			chart.draw(data, options);
		});

	}

};

Chart.init();
